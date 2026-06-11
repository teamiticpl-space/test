import type {
  DailyForecast,
  ForecastRiskSummary,
  RiskBreakdown,
  RiskLevel,
} from "@/lib/types";
import { clamp } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Risk engine
//
// Converts daily weather values into 0-100 risk scores using piecewise-linear
// scales anchored to Thai Meteorological Department (TMD) advisory bands:
//   - rainfall (mm/day): 10 = moderate, 35 = heavy, 90 = very heavy
//   - heat (°C max):     35 = hot, 40 = very hot
//   - wind (km/h max):   ~62 km/h = strong-wind warning threshold
//
// The composite score is a weighted blend. This weather lens is separate from
// the crop yield-risk lens (lib/risk/crops/), which reuses interpolate() and
// riskLevel() from here but applies its own stage × stress model.
// ---------------------------------------------------------------------------

export type AnchorPoint = readonly [value: number, score: number];

/** Piecewise-linear interpolation over anchor points sorted by x (ascending). */
export function interpolate(value: number, anchors: readonly AnchorPoint[]): number {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i - 1];
    const [x2, y2] = anchors[i];
    if (value <= x2) {
      const t = (value - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return last[1];
}

export interface RiskRule {
  id: "rain" | "heat" | "wind";
  nameTh: string;
  weight: number;
  score: (day: DailyForecast) => number;
}

export const RISK_RULES: RiskRule[] = [
  {
    id: "rain",
    nameTh: "ความเสี่ยงฝนตกหนัก",
    weight: 0.4,
    score: (day) =>
      interpolate(day.rainfall, [
        [0, 0],
        [10, 20],
        [35, 50],
        [90, 80],
        [150, 100],
      ]),
  },
  {
    id: "heat",
    nameTh: "ความเสี่ยงอากาศร้อนจัด",
    weight: 0.35,
    score: (day) =>
      interpolate(day.tempMax, [
        [32, 0],
        [35, 40],
        [38, 70],
        [40, 85],
        [43, 100],
      ]),
  },
  {
    id: "wind",
    nameTh: "ความเสี่ยงลมแรง",
    weight: 0.25,
    score: (day) =>
      interpolate(day.windSpeed, [
        [10, 0],
        [30, 30],
        [50, 60],
        [62, 80],
        [90, 100],
      ]),
  },
];

export function riskLevel(total: number): RiskLevel {
  if (total >= 67) return "high";
  if (total >= 34) return "moderate";
  return "low";
}

export const RISK_LEVEL_INFO: Record<
  RiskLevel,
  { labelTh: string; color: string; textClass: string; bgClass: string }
> = {
  low: { labelTh: "ความเสี่ยงต่ำ", color: "#10b981", textClass: "text-emerald-600", bgClass: "bg-emerald-500" },
  moderate: { labelTh: "ความเสี่ยงปานกลาง", color: "#f59e0b", textClass: "text-amber-600", bgClass: "bg-amber-500" },
  high: { labelTh: "ความเสี่ยงสูง", color: "#ef4444", textClass: "text-red-600", bgClass: "bg-red-500" },
};

/** Score a single forecast day. */
export function scoreDay(day: DailyForecast): RiskBreakdown {
  const scores: Record<RiskRule["id"], number> = { rain: 0, heat: 0, wind: 0 };
  let total = 0;
  for (const rule of RISK_RULES) {
    const s = clamp(rule.score(day), 0, 100);
    scores[rule.id] = Math.round(s);
    total += s * rule.weight;
  }
  const rounded = Math.round(clamp(total, 0, 100));
  return {
    rainRisk: scores.rain,
    heatRisk: scores.heat,
    windRisk: scores.wind,
    total: rounded,
    level: riskLevel(rounded),
  };
}

/**
 * Score a forecast window. The headline number is the worst single day —
 * the most decision-useful summary for a 15-day outlook.
 */
export function scoreForecast(days: DailyForecast[]): ForecastRiskSummary {
  if (days.length === 0) {
    const empty: RiskBreakdown = { rainRisk: 0, heatRisk: 0, windRisk: 0, total: 0, level: "low" };
    return { overall: empty, worstDate: "", daily: [] };
  }

  const daily = days.map((d) => {
    const breakdown = scoreDay(d);
    return { date: d.date, breakdown };
  });

  let worst = daily[0];
  for (const entry of daily) {
    if (entry.breakdown.total > worst.breakdown.total) worst = entry;
  }

  // The headline breakdown is the worst day's OWN components, so the three
  // bars and the composite shown together always satisfy the published
  // weighted blend (rain 40% + heat 35% + wind 25%) for that same day.
  return {
    overall: worst.breakdown,
    worstDate: worst.date,
    daily: daily.map((d) => ({
      date: d.date,
      total: d.breakdown.total,
      level: d.breakdown.level,
    })),
  };
}
