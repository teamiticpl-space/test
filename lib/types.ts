// Core domain types for the Thailand Weather Forecast Simulator

export type ThaiRegion =
  | "เหนือ"
  | "ตะวันออกเฉียงเหนือ"
  | "กลาง"
  | "ตะวันออก"
  | "ตะวันตก"
  | "ใต้";

export interface Province {
  id: string;
  nameTh: string;
  nameEn: string;
  region: ThaiRegion;
  /** Approximate province-capital coordinates (decimal degrees) */
  lat: number;
  lon: number;
}

export interface DailyForecast {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Max temperature in °C */
  tempMax: number;
  /** Min temperature in °C */
  tempMin: number;
  /** Total rainfall in mm */
  rainfall: number;
  /** Max precipitation probability in % */
  rainProbability: number;
  /** Max wind speed in km/h */
  windSpeed: number;
  /** Mean relative humidity in % */
  humidity: number;
  /** WMO weather interpretation code */
  weatherCode: number;
}

export type DataSource = "open-meteo" | "simulated";

export interface Scenario {
  /** Rainfall adjustment in percent (-100 to +100) */
  rainfallAdjustPct: number;
  /** Temperature adjustment in °C (-5 to +5) */
  tempAdjustC: number;
  /** Wind speed adjustment in percent (-100 to +100) */
  windAdjustPct: number;
}

export type RiskLevel = "low" | "moderate" | "high";

export interface RiskBreakdown {
  /** Rainfall/flood risk 0-100 */
  rainRisk: number;
  /** Heat risk 0-100 */
  heatRisk: number;
  /** Strong wind risk 0-100 */
  windRisk: number;
  /** Weighted composite 0-100 */
  total: number;
  level: RiskLevel;
}

export interface ForecastRiskSummary {
  /** Worst-day composite risk over the forecast window */
  overall: RiskBreakdown;
  /** Date of the worst day (ISO) */
  worstDate: string;
  /** Per-day composite totals, for charts and card indicators */
  daily: Array<{ date: string; total: number; level: RiskLevel }>;
}
