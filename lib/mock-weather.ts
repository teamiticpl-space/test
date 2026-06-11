import type { DailyForecast, Province, ThaiRegion } from "@/lib/types";
import { clamp, round1 } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Offline fallback: deterministic, seasonally-realistic simulated forecasts.
//
// Used when Open-Meteo is unreachable (e.g. restricted corporate networks).
// Values follow Thailand's three seasons so the simulator stays believable:
//   - ฤดูร้อน  (Mar-May):  hot, scattered thunderstorms
//   - ฤดูฝน    (Jun-Oct):  SW monsoon, frequent rain
//   - ฤดูหนาว  (Nov-Feb):  cooler and dry (north/northeast cooler)
// The south stays warm year-round with its own rainy peak (Oct-Dec).
//
// Deterministic seeding (province + date) keeps values stable across reloads.
// ---------------------------------------------------------------------------

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic. */
function createRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Season = "hot" | "rainy" | "cool";

function seasonOf(month: number, region: ThaiRegion): Season {
  if (region === "ใต้") {
    // South: no real cool season; rain peaks late in the year.
    if (month >= 9 || month <= 0) return "rainy"; // Oct-Jan
    if (month >= 4 && month <= 8) return "rainy"; // May-Sep (SW monsoon)
    return "hot";
  }
  if (month >= 2 && month <= 4) return "hot"; // Mar-May
  if (month >= 5 && month <= 9) return "rainy"; // Jun-Oct
  return "cool"; // Nov-Feb
}

interface SeasonProfile {
  tempMaxBase: number;
  tempRange: number; // gap between max and min
  rainChance: number; // 0-1
  rainHeavyChance: number; // chance a rainy day is heavy
  humidityBase: number;
  windBase: number;
}

function profileFor(season: Season, region: ThaiRegion): SeasonProfile {
  const northish = region === "เหนือ" || region === "ตะวันออกเฉียงเหนือ";
  switch (season) {
    case "hot":
      return {
        tempMaxBase: northish ? 38 : 36,
        tempRange: northish ? 12 : 9,
        rainChance: 0.25,
        rainHeavyChance: 0.2,
        humidityBase: 60,
        windBase: 14,
      };
    case "rainy":
      return {
        tempMaxBase: 33,
        tempRange: 8,
        rainChance: 0.7,
        rainHeavyChance: 0.3,
        humidityBase: 80,
        windBase: 18,
      };
    case "cool":
      return {
        tempMaxBase: northish ? 30 : 32,
        tempRange: northish ? 14 : 10,
        rainChance: 0.1,
        rainHeavyChance: 0.1,
        humidityBase: 60,
        windBase: 12,
      };
  }
}

function isoDatePlus(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function simulateDay(province: Province, date: string): DailyForecast {
  const rng = createRng(hashString(`${province.id}|${date}`));
  const month = Number(date.slice(5, 7)) - 1;
  const season = seasonOf(month, province.region);
  const p = profileFor(season, province.region);

  const tempMax = p.tempMaxBase + (rng() - 0.5) * 4;
  const tempMin = tempMax - p.tempRange + (rng() - 0.5) * 3;

  const raining = rng() < p.rainChance;
  let rainfall = 0;
  let weatherCode = season === "hot" ? (rng() < 0.5 ? 1 : 2) : 2;
  if (raining) {
    const heavy = rng() < p.rainHeavyChance;
    rainfall = heavy ? 35 + rng() * 70 : 2 + rng() * 25;
    weatherCode = heavy ? 95 : rainfall > 15 ? 63 : 61;
  } else if (season === "cool" && rng() < 0.3) {
    weatherCode = 0;
  }

  const rainProbability = raining
    ? Math.round(55 + rng() * 40)
    : Math.round(rng() * 35);
  const windSpeed = p.windBase + rng() * 12 + (weatherCode === 95 ? 15 : 0);
  const humidity = clamp(p.humidityBase + (rng() - 0.5) * 16 + (raining ? 8 : 0), 30, 99);

  return {
    date,
    tempMax: round1(tempMax),
    tempMin: round1(tempMin),
    rainfall: round1(rainfall),
    rainProbability,
    windSpeed: round1(windSpeed),
    humidity: Math.round(humidity),
    weatherCode,
  };
}

/** Generate deterministic simulated 15-day forecasts for every province. */
export function generateSimulatedForecasts(
  provinces: Province[],
  days: number,
): Record<string, DailyForecast[]> {
  const out: Record<string, DailyForecast[]> = {};
  for (const province of provinces) {
    const list: DailyForecast[] = [];
    for (let i = 0; i < days; i++) {
      list.push(simulateDay(province, isoDatePlus(i)));
    }
    out[province.id] = list;
  }
  return out;
}
