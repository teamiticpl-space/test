"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  CloudRain,
  Lightbulb,
  Snowflake,
  Sprout,
  Sun,
  ThermometerSun,
  Wheat,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { RiskGauge, type GaugeComponentItem } from "@/components/risk-gauge";
import { AgronomyAdvice } from "@/components/agronomy-advice";
import { Button } from "@/components/ui/button";
import type { DailyForecast } from "@/lib/types";
import {
  scoreCropForecast,
  suggestBestPlanting,
  SOIL_TYPES,
  type CropModel,
  type CropVariety,
  type SoilType,
  type StressFactorId,
} from "@/lib/risk/crops";
import { useWeatherStore } from "@/stores/weather-store";
import { cn, formatThaiDateShort, shiftDays, todayIso } from "@/lib/utils";

const FACTOR_ICONS: Record<StressFactorId, { icon: LucideIcon; color: string }> = {
  flood: { icon: CloudRain, color: "#2563eb" },
  drought: { icon: Sun, color: "#d97706" },
  heat: { icon: ThermometerSun, color: "#f97316" },
  wind: { icon: Wind, color: "#0d9488" },
  cold: { icon: Snowflake, color: "#0ea5e9" },
};

const SOWING_PRESETS = [
  { labelSuffix: "วันนี้", offsetDays: 0 },
  { labelSuffix: "30 วันก่อน", offsetDays: -30 },
  { labelSuffix: "60 วันก่อน", offsetDays: -60 },
  { labelSuffix: "90 วันก่อน", offsetDays: -90 },
];

interface CropRiskPanelProps {
  crop: CropModel;
  variety: CropVariety;
  /** Scenario-adjusted forecast for the selected province */
  days: DailyForecast[];
}

export function CropRiskPanel({ crop, variety, days }: CropRiskPanelProps) {
  const plantingDate = useWeatherStore((s) => s.plantingDate);
  const setPlantingDate = useWeatherStore((s) => s.setPlantingDate);
  const varietyId = useWeatherStore((s) => s.varietyId);
  const setVarietyId = useWeatherStore((s) => s.setVarietyId);
  const soilType = useWeatherStore((s) => s.soilType);
  const setSoilType = useWeatherStore((s) => s.setSoilType);

  const summary = useMemo(
    () => scoreCropForecast(days, plantingDate, crop, variety),
    [days, plantingDate, crop, variety],
  );
  const bestPlanting = useMemo(
    () => suggestBestPlanting(days, crop, variety),
    [days, crop, variety],
  );

  // Always show all five stresses (even at 0) so a bar never silently appears
  // or disappears when inputs change — the width animation conveys the change.
  const gaugeComponents: GaugeComponentItem[] = useMemo(
    () =>
      summary.components.map((c) => ({
        labelTh: c.labelTh,
        value: c.value,
        color: FACTOR_ICONS[c.id].color,
        icon: FACTOR_ICONS[c.id].icon,
      })),
    [summary.components],
  );

  const today = todayIso();
  // Only allow planting dates where the crop is still growing during the
  // 15-day forecast window, so every selectable date produces a real score:
  //   - earliest: cycleDays-1 days ago (today is the crop's last living day)
  //   - latest: the last forecast day (plant now → germination shows in window)
  const FORECAST_WINDOW_DAYS = 15;
  const minDate = shiftDays(today, -(variety.cycleDays - 1));
  const maxDate = shiftDays(today, FORECAST_WINDOW_DAYS - 1);

  return (
    <div className="space-y-4">
      {/* Variety + soil selectors */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="crop-variety"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
          >
            <Wheat className="h-4 w-4 text-primary" />
            พันธุ์
          </label>
          <select
            id="crop-variety"
            value={varietyId}
            onChange={(e) => setVarietyId(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {crop.varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nameTh} ({v.cycleDays} วัน)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <Sprout className="h-4 w-4 text-primary" />
            ชนิดดิน
          </label>
          <div role="radiogroup" aria-label="ชนิดดิน" className="flex rounded-lg bg-muted p-0.5">
            {SOIL_TYPES.map((s) => {
              const active = s.id === soilType;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSoilType(s.id as SoilType)}
                  className={cn(
                    "flex-1 rounded-md px-1 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.labelTh}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="-mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {variety.subtypeTh} • {variety.noteTh}
        {variety.photoperiodSensitive && " (อายุเป็นค่าโดยประมาณ เพราะพันธุ์นี้ออกดอกตามช่วงแสง)"}
      </p>

      {/* Planting date controls */}
      <div>
        <label
          htmlFor="planting-date"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"
        >
          <CalendarDays className="h-4 w-4 text-primary" />
          {crop.plantingLabelTh}
        </label>
        <input
          id="planting-date"
          type="date"
          value={plantingDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setPlantingDate(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SOWING_PRESETS.map((p) => {
            const date = shiftDays(today, p.offsetDays);
            const active = date === plantingDate;
            const label = p.offsetDays === 0 ? `${crop.plantVerbTh}วันนี้` : p.labelSuffix;
            return (
              <Button
                key={p.labelSuffix}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn("h-7 px-2.5 text-xs", !active && "text-muted-foreground")}
                onClick={() => setPlantingDate(date)}
              >
                {label}
              </Button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          เลือกได้เฉพาะช่วงที่ {crop.nameTh} ยังอยู่ในรอบเพาะปลูกและตรงกับพยากรณ์ 15 วันข้างหน้า
          (ระบบประเมินจากอากาศที่พยากรณ์ได้เท่านั้น ไม่ใช่อากาศย้อนหลัง)
        </p>
      </div>

      {/* Stages visible in the forecast window */}
      {summary.stagesInWindow.length > 0 && (
        <div className="rounded-lg bg-secondary/60 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-secondary-foreground">
            <Sprout className="h-3.5 w-3.5" />
            ระยะ{crop.nameTh}ในช่วง 15 วันนี้
          </p>
          <p className="mt-1 text-xs text-secondary-foreground/90">
            {summary.stagesInWindow
              .map((s) =>
                s.fromDate === s.toDate
                  ? `${s.labelTh} (${formatThaiDateShort(s.fromDate)})`
                  : `${s.labelTh} (${formatThaiDateShort(s.fromDate)} - ${formatThaiDateShort(s.toDate)})`,
              )
              .join(" → ")}
          </p>
        </div>
      )}

      {summary.note ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          {summary.note}
        </div>
      ) : (
        <RiskGauge
          total={summary.total}
          level={summary.level}
          worstDate={summary.worstDate}
          components={gaugeComponents}
        />
      )}

      {summary.recommendations.length > 0 && (
        <div className="space-y-1.5">
          {summary.recommendations.map((r) => (
            <p
              key={r}
              className="flex items-start gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-foreground"
            >
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              {r}
            </p>
          ))}
        </div>
      )}

      {bestPlanting && (
        <p className="text-xs text-muted-foreground">
          ยังไม่{crop.plantVerbTh}? วัน{crop.plantVerbTh}ที่เสี่ยงต่ำสุดใน 10 วันข้างหน้าคือ{" "}
          <button
            type="button"
            onClick={() => setPlantingDate(bestPlanting.date)}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {bestPlanting.labelTh}
          </button>{" "}
          (ประเมินเฉพาะช่วงตั้งตัวเท่าที่พยากรณ์ครอบคลุม)
        </p>
      )}

      {!summary.note && (
        <div className="border-t border-border pt-4">
          <AgronomyAdvice crop={crop} days={days} summary={summary} variety={variety} soil={soilType} />
        </div>
      )}
    </div>
  );
}
