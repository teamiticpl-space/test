import type { DailyForecast, Scenario } from "@/lib/types";
import { clamp, round1 } from "@/lib/utils";

export const DEFAULT_SCENARIO: Scenario = {
  rainfallAdjustPct: 0,
  tempAdjustC: 0,
  windAdjustPct: 0,
};

export const SCENARIO_LIMITS = {
  rainfallAdjustPct: { min: -100, max: 100, step: 5 },
  tempAdjustC: { min: -5, max: 5, step: 0.5 },
  windAdjustPct: { min: -100, max: 100, step: 5 },
} as const;

export function isScenarioActive(s: Scenario): boolean {
  return s.rainfallAdjustPct !== 0 || s.tempAdjustC !== 0 || s.windAdjustPct !== 0;
}

/**
 * Apply what-if adjustments to a forecast window. Pure function — the base
 * forecast stays untouched so the scenario can be reset instantly.
 */
export function applyScenario(days: DailyForecast[], s: Scenario): DailyForecast[] {
  if (!isScenarioActive(s)) return days;
  const rainFactor = 1 + s.rainfallAdjustPct / 100;
  const windFactor = 1 + s.windAdjustPct / 100;
  return days.map((d) => ({
    ...d,
    rainfall: round1(Math.max(0, d.rainfall * rainFactor)),
    tempMax: round1(d.tempMax + s.tempAdjustC),
    tempMin: round1(d.tempMin + s.tempAdjustC),
    windSpeed: round1(Math.max(0, d.windSpeed * windFactor)),
    rainProbability: Math.round(clamp(d.rainProbability * rainFactor, 0, 100)),
  }));
}
