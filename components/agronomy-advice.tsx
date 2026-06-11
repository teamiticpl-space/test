"use client";

import { useMemo } from "react";
import { Bug, FlaskConical, Info, Leaf } from "lucide-react";
import type { DailyForecast } from "@/lib/types";
import {
  cropFertilizerCaution,
  cropProtectionAlerts,
  fertilizerPlan,
  type CropModel,
  type CropRiskSummary,
  type CropVariety,
  type SoilType,
} from "@/lib/risk/crops";
import { RISK_LEVEL_INFO } from "@/lib/risk/risk-engine";
import { cn } from "@/lib/utils";

interface AgronomyAdviceProps {
  crop: CropModel;
  days: DailyForecast[];
  summary: CropRiskSummary;
  variety: CropVariety;
  soil: SoilType;
}

const SEVERITY_BADGE: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  moderate: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function AgronomyAdvice({ crop, days, summary, variety, soil }: AgronomyAdviceProps) {
  const plan = useMemo(() => fertilizerPlan(crop, soil), [crop, soil]);
  const caution = useMemo(() => cropFertilizerCaution(crop, days), [crop, days]);
  const alerts = useMemo(
    () => cropProtectionAlerts(crop, days, summary, variety),
    [crop, days, summary, variety],
  );

  const stagesNow = new Set(summary.stagesInWindow.map((s) => s.id));

  return (
    <div className="space-y-4">
      {/* Fertilizer plan */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <FlaskConical className="h-4 w-4 text-primary" />
          แผนการใส่ปุ๋ย{crop.nameTh}
        </p>
        <div className="space-y-2">
          {plan.map((step) => {
            const isNow = stagesNow.has(step.stageId);
            return (
              <div
                key={step.stageId}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  isNow ? "border-primary/50 bg-primary/5" : "border-border bg-card",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{step.timingTh}</span>
                  {isNow && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      ช่วงนี้
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-foreground">
                  <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-medium">{step.productTh}</span>
                  <span className="text-muted-foreground">· {step.rateTh}</span>
                </p>
                <p className="mt-0.5 text-muted-foreground">{step.purposeTh}</p>
              </div>
            );
          })}
        </div>
        {caution && (
          <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {caution}
          </p>
        )}
      </div>

      {/* Weather-driven crop protection */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Bug className="h-4 w-4 text-primary" />
          เฝ้าระวังโรค/แมลง (ตามสภาพอากาศจำลอง)
        </p>
        {alerts.length === 0 ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            ช่วงพยากรณ์นี้ความเสี่ยงโรค/แมลงต่ำ แต่ควรสำรวจแปลงสม่ำเสมอ
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{a.threatTh}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      SEVERITY_BADGE[a.severity],
                    )}
                  >
                    {RISK_LEVEL_INFO[a.severity].labelTh.replace("ความเสี่ยง", "")}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{a.causeTh}</p>
                <p className="mt-1 text-foreground">{a.actionTh}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        คำแนะนำเป็นแนวทางทั่วไปเพื่อการวางแผน อัตราปุ๋ยและการใช้สารกำจัดศัตรูพืชควรยึดตามฉลากผลิตภัณฑ์
        ผลวิเคราะห์ดิน และคำแนะนำของเกษตรอำเภอ/กรมวิชาการเกษตร เน้นสำรวจแปลงก่อนตัดสินใจพ่นสาร
      </p>
    </div>
  );
}
