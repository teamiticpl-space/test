import type { DailyForecast, RiskLevel } from "@/lib/types";
import { interpolate, riskLevel, type AnchorPoint } from "@/lib/risk/risk-engine";
import { clamp, diffDays, formatThaiDateShort } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Generic crop yield-risk engine.
//
// One stage × stress model serves every crop. A crop is pure DATA (CropModel):
// growth stages as fractions of its cycle, each stage's sensitivity to five
// weather stresses, varieties, fertilizer plan, and weather-driven crop
// protection. Scoring scales stage day-ranges to the chosen variety's cycle,
// applies stage sensitivity × variety tolerance, takes the worst single day,
// and reports that day's own component breakdown (so the headline always
// equals the tallest bar). Only stages inside the 15-day window are assessed.
// ---------------------------------------------------------------------------

export type StressFactorId = "flood" | "drought" | "heat" | "wind" | "cold";

export const FACTOR_IDS: StressFactorId[] = ["flood", "drought", "heat", "wind", "cold"];

export type SoilType = "clay" | "loam" | "sandy";

export const SOIL_TYPES: Array<{ id: SoilType; labelTh: string }> = [
  { id: "clay", labelTh: "ดินเหนียว" },
  { id: "loam", labelTh: "ดินร่วน" },
  { id: "sandy", labelTh: "ดินทราย" },
];

export interface CropStageDef {
  id: string;
  labelTh: string;
  /** Cumulative share of the cycle where this stage ends (0-1, last = 1) */
  endFraction: number;
  sensitivity: Record<StressFactorId, number>;
}

export interface ResolvedStage {
  id: string;
  labelTh: string;
  fromDas: number;
  toDas: number;
  sensitivity: Record<StressFactorId, number>;
}

export interface CropVariety {
  id: string;
  nameTh: string;
  nameEn: string;
  /** sub-classification shown next to the name, e.g. type or maturity class */
  subtypeTh: string;
  cycleDays: number;
  heatFactor: number;
  coldFactor: number;
  photoperiodSensitive?: boolean;
  noteTh: string;
}

export interface FertilizerStep {
  stageId: string;
  timingTh: string;
  productTh: string;
  rateTh: string;
  purposeTh: string;
}

export interface ProtectionAlert {
  id: string;
  threatTh: string;
  causeTh: string;
  severity: RiskLevel;
  actionTh: string;
}

export interface WindowStats {
  humidityMean: number;
  rainTotal: number;
  rainyDays: number;
  maxTemp: number;
  minTemp: number;
  maxWind: number;
}

export interface ProtectionContext {
  stats: WindowStats;
  /** Ids of stages present inside the forecast window */
  stages: Set<string>;
  variety: CropVariety;
}

export interface CropModel {
  id: string;
  nameTh: string;
  nameEn: string;
  /** lucide-react icon key resolved by the UI */
  iconKey: string;
  /** hex accent for chips/markers context */
  accent: string;
  /** planting verb, e.g. "หว่าน" (rice) or "ปลูก" (others) */
  plantVerbTh: string;
  /** label for the planting-date control, e.g. "วันที่หว่านข้าว" */
  plantingLabelTh: string;
  varieties: CropVariety[];
  defaultVarietyId: string;
  stages: CropStageDef[];
  factorLabels: Record<StressFactorId, string>;
  factorAdvice: Partial<Record<StressFactorId, Record<string, string>>>;
  genericAdvice: Record<StressFactorId, string>;
  fertilizer: Record<SoilType, FertilizerStep[]>;
  /** Optional scenario-aware fertilizer caution (e.g. lower N in wet weather) */
  fertilizerCaution?: (stats: WindowStats) => string | null;
  /** Build weather-driven crop-protection alerts */
  buildProtection: (ctx: ProtectionContext) => ProtectionAlert[];
  /** Footer explanation of the scoring method for this crop */
  scoringNoteTh: string;
}

// --- Shared weather-severity anchors (crop response comes from sensitivity) ---

const FLOOD_ANCHORS: readonly AnchorPoint[] = [
  [10, 0],
  [35, 35],
  [60, 60],
  [90, 85],
  [150, 100],
];
const HEAT_ANCHORS: readonly AnchorPoint[] = [
  [33, 0],
  [35, 30],
  [37, 60],
  [39, 85],
  [41, 100],
];
const WIND_ANCHORS: readonly AnchorPoint[] = [
  [15, 0],
  [30, 25],
  [45, 55],
  [62, 80],
  [85, 100],
];
// tempMin ascending → score descending (colder = worse)
const COLD_ANCHORS: readonly AnchorPoint[] = [
  [10, 100],
  [12, 85],
  [14, 60],
  [16, 30],
  [18, 0],
];
// Trailing 5-day rainfall total (mm) — less rain = more drought stress
const DROUGHT_ANCHORS: readonly AnchorPoint[] = [
  [0, 100],
  [8, 75],
  [15, 45],
  [25, 15],
  [35, 0],
];

// Trailing rainfall over up to `span` days, scaled to a full-span equivalent.
// DROUGHT_ANCHORS are calibrated for a 5-day total, so on early days (fewer
// than `span` days available) we scale the partial sum up to the full span:
// (partial_sum * span) / actual_days. This keeps drought comparison fair on day 1.
function trailingRain(days: DailyForecast[], index: number, span = 5): number {
  const from = Math.max(0, index - span + 1);
  let sum = 0;
  for (let i = from; i <= index; i++) sum += days[i].rainfall;
  const count = index - from + 1;
  return (sum * span) / count;
}

function factorBaseScore(factor: StressFactorId, day: DailyForecast, trailing: number): number {
  switch (factor) {
    case "flood":
      return interpolate(day.rainfall, FLOOD_ANCHORS);
    case "drought":
      return interpolate(trailing, DROUGHT_ANCHORS);
    case "heat":
      return interpolate(day.tempMax, HEAT_ANCHORS);
    case "wind":
      return interpolate(day.windSpeed, WIND_ANCHORS);
    case "cold":
      return interpolate(day.tempMin, COLD_ANCHORS);
  }
}

function varietyFactorMultiplier(factor: StressFactorId, variety: CropVariety): number {
  if (factor === "heat") return variety.heatFactor;
  if (factor === "cold") return variety.coldFactor;
  return 1;
}

/**
 * Resolve stage fractions into contiguous day ranges for a cycle length.
 * A cycle of N days spans DAS 0..N-1, so the last stage ends at cycleDays-1.
 */
export function stagesForCycle(stageDefs: CropStageDef[], cycleDays: number): ResolvedStage[] {
  let from = 0;
  return stageDefs.map((def, i) => {
    const isLast = i === stageDefs.length - 1;
    const to = isLast ? cycleDays - 1 : Math.round(def.endFraction * cycleDays) - 1;
    const stage: ResolvedStage = {
      id: def.id,
      labelTh: def.labelTh,
      fromDas: from,
      toDas: to,
      sensitivity: def.sensitivity,
    };
    from = to + 1;
    return stage;
  });
}

function stageForDas(das: number, stages: ResolvedStage[], cycleDays: number): ResolvedStage | null {
  // DAS runs 0..cycleDays-1; das === cycleDays means the cycle has ended.
  if (das < 0 || das >= cycleDays) return null;
  return stages.find((s) => das >= s.fromDas && das <= s.toDas) ?? null;
}

export interface CropDailyRisk {
  date: string;
  total: number;
  level: RiskLevel;
  stageId: string | null;
  stageLabelTh: string | null;
}

export interface CropRiskSummary {
  total: number;
  level: RiskLevel;
  worstDate: string;
  daily: CropDailyRisk[];
  components: Array<{ id: StressFactorId; labelTh: string; value: number }>;
  stagesInWindow: Array<{ id: string; labelTh: string; fromDate: string; toDate: string }>;
  recommendations: string[];
  note: string | null;
  variety: CropVariety;
  cropId: string;
}

/** Score crop yield risk for the forecast window given a planting date + variety. */
export function scoreCropForecast(
  days: DailyForecast[],
  plantingDateIso: string,
  crop: CropModel,
  variety: CropVariety,
): CropRiskSummary {
  const stages = stagesForCycle(crop.stages, variety.cycleDays);
  const advisories: Array<{ factor: StressFactorId; stage: string; score: number }> = [];
  const perDayFactors: Array<Record<StressFactorId, number> | null> = [];

  const daily: CropDailyRisk[] = days.map((day, i) => {
    const das = diffDays(day.date, plantingDateIso);
    const stage = stageForDas(das, stages, variety.cycleDays);
    if (!stage) {
      perDayFactors.push(null);
      return { date: day.date, total: 0, level: "low", stageId: null, stageLabelTh: null };
    }
    const trailing = trailingRain(days, i);
    const factors: Record<StressFactorId, number> = { flood: 0, drought: 0, heat: 0, wind: 0, cold: 0 };
    let dayTotal = 0;
    for (const factor of FACTOR_IDS) {
      const score = clamp(
        factorBaseScore(factor, day, trailing) *
          stage.sensitivity[factor] *
          varietyFactorMultiplier(factor, variety),
        0,
        100,
      );
      factors[factor] = Math.round(score);
      if (score > dayTotal) dayTotal = score;
      if (score >= 40) advisories.push({ factor, stage: stage.id, score });
    }
    perDayFactors.push(factors);
    const rounded = Math.round(dayTotal);
    return {
      date: day.date,
      total: rounded,
      level: riskLevel(rounded),
      stageId: stage.id,
      stageLabelTh: stage.labelTh,
    };
  });

  let worstIndex = 0;
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].total > daily[worstIndex].total) worstIndex = i;
  }
  const worst = daily[worstIndex] ?? { date: "", total: 0, level: "low" as RiskLevel };
  const worstFactors = perDayFactors[worstIndex];

  const stagesInWindow: CropRiskSummary["stagesInWindow"] = [];
  for (const d of daily) {
    if (!d.stageId || !d.stageLabelTh) continue;
    const last = stagesInWindow[stagesInWindow.length - 1];
    if (last && last.id === d.stageId) {
      last.toDate = d.date;
    } else {
      stagesInWindow.push({ id: d.stageId, labelTh: d.stageLabelTh, fromDate: d.date, toDate: d.date });
    }
  }

  const recommendations: string[] = [];
  const seenFactors = new Set<StressFactorId>();
  for (const a of advisories.sort((x, y) => y.score - x.score)) {
    if (seenFactors.has(a.factor)) continue;
    seenFactors.add(a.factor);
    recommendations.push(crop.factorAdvice[a.factor]?.[a.stage] ?? crop.genericAdvice[a.factor]);
    if (recommendations.length >= 2) break;
  }

  let note: string | null = null;
  if (stagesInWindow.length === 0 && days.length > 0) {
    const dasFirst = diffDays(days[0].date, plantingDateIso);
    note =
      dasFirst < 0
        ? `วัน${crop.plantVerbTh}ที่เลือกอยู่หลังช่วงพยากรณ์ 15 วัน จึงยังประเมินความเสี่ยงไม่ได้ — เลือกวัน${crop.plantVerbTh}ภายใน 15 วันข้างหน้า หรือในอดีต`
        : `รอบนี้พ้นช่วงเก็บเกี่ยวแล้ว (เกิน ${variety.cycleDays} วันหลัง${crop.plantVerbTh}) จึงไม่มีความเสี่ยงต่อผลผลิตในช่วงพยากรณ์`;
  }

  return {
    total: worst.total,
    level: riskLevel(worst.total),
    worstDate: worst.total > 0 ? worst.date : "",
    daily,
    components: FACTOR_IDS.map((id) => ({
      id,
      labelTh: crop.factorLabels[id],
      value: worstFactors ? worstFactors[id] : 0,
    })),
    stagesInWindow,
    recommendations,
    note,
    variety,
    cropId: crop.id,
  };
}

/**
 * Suggest the lowest-risk planting date among the next several forecast days,
 * comparing every candidate over the SAME number of early establishment days
 * (the first stage) using its worst single day — avoids favoring later dates
 * that see fewer forecast days.
 */
export function suggestBestPlanting(
  days: DailyForecast[],
  crop: CropModel,
  variety: CropVariety,
): { date: string; score: number; labelTh: string } | null {
  if (days.length < 10) return null;
  const maxOffset = Math.min(7, days.length - 8);
  if (maxOffset < 1) return null;
  const commonSpan = Math.min(16, days.length - maxOffset);
  if (commonSpan < 5) return null;

  const firstStageId = crop.stages[0]?.id;
  let best: { date: string; score: number } | null = null;
  for (let k = 0; k <= maxOffset; k++) {
    const summary = scoreCropForecast(days, days[k].date, crop, variety);
    const establish = summary.daily
      .slice(k, k + commonSpan)
      .filter((d) => d.stageId === firstStageId);
    if (establish.length < commonSpan) continue;
    const worstEstablish = Math.max(...establish.map((d) => d.total));
    if (!best || worstEstablish < best.score) {
      best = { date: days[k].date, score: worstEstablish };
    }
  }
  if (!best) return null;
  return { ...best, labelTh: formatThaiDateShort(best.date) };
}

// --- Fertilizer + protection helpers ---

export function fertilizerPlan(crop: CropModel, soil: SoilType): FertilizerStep[] {
  return crop.fertilizer[soil];
}

export function cropFertilizerCaution(crop: CropModel, days: DailyForecast[]): string | null {
  if (!crop.fertilizerCaution) return null;
  return crop.fertilizerCaution(windowStats(days));
}

const SEVERITY_RANK: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };

export function windowStats(days: DailyForecast[]): WindowStats {
  if (days.length === 0) {
    return { humidityMean: 0, rainTotal: 0, rainyDays: 0, maxTemp: 0, minTemp: 99, maxWind: 0 };
  }
  let humSum = 0;
  let rainTotal = 0;
  let rainyDays = 0;
  let maxTemp = -99;
  let minTemp = 99;
  let maxWind = 0;
  for (const d of days) {
    humSum += d.humidity;
    rainTotal += d.rainfall;
    if (d.rainfall >= 10) rainyDays++;
    if (d.tempMax > maxTemp) maxTemp = d.tempMax;
    if (d.tempMin < minTemp) minTemp = d.tempMin;
    if (d.windSpeed > maxWind) maxWind = d.windSpeed;
  }
  return { humidityMean: humSum / days.length, rainTotal, rainyDays, maxTemp, minTemp, maxWind };
}

export function cropProtectionAlerts(
  crop: CropModel,
  days: DailyForecast[],
  summary: CropRiskSummary,
  variety: CropVariety,
): ProtectionAlert[] {
  const stages = new Set(summary.stagesInWindow.map((s) => s.id));
  if (stages.size === 0) return [];
  const alerts = crop.buildProtection({ stats: windowStats(days), stages, variety });
  return alerts.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]).slice(0, 3);
}
