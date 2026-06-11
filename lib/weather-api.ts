import type { DailyForecast, Province } from "@/lib/types";

// Open-Meteo forecast API (no API key required).
// Contract verified against https://open-meteo.com/en/docs :
//   - forecast_days supports up to 16
//   - multiple coordinates can be batched in one request (comma separated)
//   - daily variables used below are all supported
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
export const FORECAST_DAYS = 15;
const REQUEST_TIMEOUT_MS = 12_000;

const DAILY_VARS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "relative_humidity_2m_mean",
  "weather_code",
].join(",");

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: Array<number | null>;
  temperature_2m_min: Array<number | null>;
  precipitation_sum: Array<number | null>;
  precipitation_probability_max: Array<number | null>;
  wind_speed_10m_max: Array<number | null>;
  relative_humidity_2m_mean: Array<number | null>;
  weather_code: Array<number | null>;
}

interface OpenMeteoResult {
  latitude: number;
  longitude: number;
  daily: OpenMeteoDaily;
}

function toDailyForecasts(daily: OpenMeteoDaily): DailyForecast[] {
  return daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i] ?? 0,
    tempMin: daily.temperature_2m_min[i] ?? 0,
    rainfall: daily.precipitation_sum[i] ?? 0,
    rainProbability: daily.precipitation_probability_max[i] ?? 0,
    windSpeed: daily.wind_speed_10m_max[i] ?? 0,
    humidity: daily.relative_humidity_2m_mean[i] ?? 0,
    weatherCode: daily.weather_code[i] ?? 3,
  }));
}

/**
 * Fetch 15-day forecasts for every province in ONE batched request.
 * Throws on network/HTTP failure — callers fall back to simulated data.
 */
export async function fetchAllForecasts(
  provinces: Province[],
): Promise<Record<string, DailyForecast[]>> {
  const lats = provinces.map((p) => p.lat).join(",");
  const lons = provinces.map((p) => p.lon).join(",");
  const url =
    `${BASE_URL}?latitude=${lats}&longitude=${lons}` +
    `&daily=${DAILY_VARS}&forecast_days=${FORECAST_DAYS}&timezone=Asia%2FBangkok`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Open-Meteo responded with HTTP ${res.status}`);
    }
    const json: unknown = await res.json();
    // Open-Meteo contract: a single coordinate returns one object, while two
    // or more coordinates return an array ordered the same as the request.
    // We always send 77 coordinates, so the array branch is the normal path;
    // the object branch is kept defensively for future single-province use.
    // The length check below rejects any unexpected shape.
    const results: OpenMeteoResult[] = Array.isArray(json)
      ? (json as OpenMeteoResult[])
      : [json as OpenMeteoResult];

    if (results.length !== provinces.length) {
      throw new Error(
        `Expected ${provinces.length} results, got ${results.length}`,
      );
    }

    const out: Record<string, DailyForecast[]> = {};
    provinces.forEach((p, i) => {
      const daily = results[i]?.daily;
      if (!daily?.time?.length) {
        throw new Error(`Missing daily data for ${p.nameEn}`);
      }
      out[p.id] = toDailyForecasts(daily);
    });
    return out;
  } finally {
    clearTimeout(timer);
  }
}
