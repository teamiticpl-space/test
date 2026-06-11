"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCENARIO_LIMITS, isScenarioActive } from "@/lib/scenario";
import { useWeatherStore } from "@/stores/weather-store";

function signed(value: number, unit: string): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${unit}`;
}

export function ScenarioControls() {
  const scenario = useWeatherStore((s) => s.scenario);
  const setScenario = useWeatherStore((s) => s.setScenario);
  const resetScenario = useWeatherStore((s) => s.resetScenario);
  const active = isScenarioActive(scenario);

  const controls = [
    {
      key: "rainfallAdjustPct" as const,
      labelTh: "ปริมาณฝน",
      value: scenario.rainfallAdjustPct,
      display: signed(scenario.rainfallAdjustPct, "%"),
      ...SCENARIO_LIMITS.rainfallAdjustPct,
    },
    {
      key: "tempAdjustC" as const,
      labelTh: "อุณหภูมิ",
      value: scenario.tempAdjustC,
      display: signed(scenario.tempAdjustC, "°C"),
      ...SCENARIO_LIMITS.tempAdjustC,
    },
    {
      key: "windAdjustPct" as const,
      labelTh: "ความเร็วลม",
      value: scenario.windAdjustPct,
      display: signed(scenario.windAdjustPct, "%"),
      ...SCENARIO_LIMITS.windAdjustPct,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          ลองปรับค่าเพื่อดูผลกระทบต่อความเสี่ยงทันที
        </p>
        {active && <Badge variant="warning">กำลังจำลอง</Badge>}
      </div>

      {controls.map((c) => (
        <div key={c.key}>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">{c.labelTh}</label>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
              {c.display}
            </span>
          </div>
          <Slider
            value={[c.value]}
            min={c.min}
            max={c.max}
            step={c.step}
            onValueChange={([v]) => setScenario({ [c.key]: v })}
            aria-label={c.labelTh}
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{c.min}{c.key === "tempAdjustC" ? "°C" : "%"}</span>
            <span>{c.max > 0 ? "+" : ""}{c.max}{c.key === "tempAdjustC" ? "°C" : "%"}</span>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={resetScenario}
        disabled={!active}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        รีเซ็ตเป็นค่าพยากรณ์จริง
      </Button>
    </div>
  );
}
