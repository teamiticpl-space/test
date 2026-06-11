"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CloudRain, CloudSunRain, Info, ThermometerSun, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CropSelector } from "@/components/crop-selector";
import { ProvinceSelector } from "@/components/province-selector";
import { ForecastCards } from "@/components/forecast-cards";
import { WeatherChart } from "@/components/weather-chart";
import { RiskGauge, type GaugeComponentItem } from "@/components/risk-gauge";
import { CropRiskPanel } from "@/components/crop-risk-panel";
import { ScenarioControls } from "@/components/scenario-controls";
import { DataSourceBadge } from "@/components/data-source-badge";
import type { MapMarkerData } from "@/components/thailand-map";
import { useWeatherStore } from "@/stores/weather-store";
import { PROVINCES, getProvince } from "@/lib/provinces";
import { applyScenario } from "@/lib/scenario";
import { scoreForecast, RISK_LEVEL_INFO } from "@/lib/risk/risk-engine";
import { scoreCropForecast, getCrop, defaultCrop, getCropVariety } from "@/lib/risk/crops";

// Leaflet requires `window`, so the map loads client-side only.
const ThailandMap = dynamic(() => import("@/components/thailand-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const selectedProvinceId = useWeatherStore((s) => s.selectedProvinceId);
  const scenario = useWeatherStore((s) => s.scenario);
  const data = useWeatherStore((s) => s.data);
  const source = useWeatherStore((s) => s.source);
  const loading = useWeatherStore((s) => s.loading);
  const error = useWeatherStore((s) => s.error);
  const viewMode = useWeatherStore((s) => s.viewMode);
  const cropId = useWeatherStore((s) => s.cropId);
  const plantingDate = useWeatherStore((s) => s.plantingDate);
  const varietyId = useWeatherStore((s) => s.varietyId);
  const selectProvince = useWeatherStore((s) => s.selectProvince);
  const loadAll = useWeatherStore((s) => s.loadAll);

  const crop = getCrop(cropId) ?? defaultCrop();
  const variety = getCropVariety(crop, varietyId);
  const isCrop = viewMode === "crop";

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const province = getProvince(selectedProvinceId);

  // Scenario-adjusted forecast for the selected province
  const adjustedDays = useMemo(() => {
    const base = data?.[selectedProvinceId];
    if (!base) return [];
    return applyScenario(base, scenario);
  }, [data, selectedProvinceId, scenario]);

  const riskSummary = useMemo(() => scoreForecast(adjustedDays), [adjustedDays]);

  const cropSummary = useMemo(
    () => (adjustedDays.length > 0 ? scoreCropForecast(adjustedDays, plantingDate, crop, variety) : null),
    [adjustedDays, plantingDate, crop, variety],
  );

  // Daily dots on the forecast cards follow the active risk lens
  const dailyDots = isCrop && cropSummary ? cropSummary.daily : riskSummary.daily;

  // Risk markers for every province (recomputed when scenario/crop/mode changes)
  const markers = useMemo<MapMarkerData[]>(() => {
    if (!data) return [];
    return PROVINCES.flatMap((p) => {
      const base = data[p.id];
      if (!base) return [];
      const adjusted = applyScenario(base, scenario);
      let total: number;
      let level: MapMarkerData["level"];
      if (isCrop) {
        const s = scoreCropForecast(adjusted, plantingDate, crop, variety);
        total = s.total;
        level = s.level;
      } else {
        const s = scoreForecast(adjusted);
        total = s.overall.total;
        level = s.overall.level;
      }
      return [{ provinceId: p.id, nameTh: p.nameTh, lat: p.lat, lon: p.lon, total, level }];
    });
  }, [data, scenario, isCrop, plantingDate, crop, variety]);

  const weatherGaugeComponents: GaugeComponentItem[] = [
    { labelTh: "ฝนตกหนัก", value: riskSummary.overall.rainRisk, color: "#2563eb", icon: CloudRain },
    { labelTh: "อากาศร้อน", value: riskSummary.overall.heatRisk, color: "#f97316", icon: ThermometerSun },
    { labelTh: "ลมแรง", value: riskSummary.overall.windRisk, color: "#0d9488", icon: Wind },
  ];

  const ready = !loading && data !== null && adjustedDays.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CloudSunRain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                จำลองพยากรณ์อากาศประเทศไทย
              </h1>
              <p className="text-xs text-muted-foreground">
                พยากรณ์ 15 วัน พร้อมจำลองสถานการณ์และประเมินความเสี่ยง
              </p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <DataSourceBadge source={source} loading={loading} />
            <ProvinceSelector />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Map */}
          <motion.div {...sectionMotion} transition={{ duration: 0.35 }} className="lg:col-span-2">
            <Card className="flex h-full flex-col">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>แผนที่ความเสี่ยงรายจังหวัด</CardTitle>
                  <CardDescription className="mt-1">
                    คลิกหมุดเพื่อเลือกจังหวัด • สีตามระดับความเสี่ยง
                    {isCrop ? `การปลูก${crop.nameTh} (วัน${crop.plantVerbTh}เดียวกันทุกจังหวัด)` : "สภาพอากาศ"}
                  </CardDescription>
                </div>
                <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                  {(["low", "moderate", "high"] as const).map((level) => (
                    <span key={level} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: RISK_LEVEL_INFO[level].color }}
                      />
                      {RISK_LEVEL_INFO[level].labelTh.replace("ความเสี่ยง", "")}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-full min-h-[440px] overflow-hidden rounded-xl border border-border bg-muted">
                  {ready ? (
                    <ThailandMap
                      markers={markers}
                      selectedId={selectedProvinceId}
                      onSelect={selectProvince}
                    />
                  ) : (
                    <Skeleton className="h-full w-full rounded-xl" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk gauge + scenario controls */}
          <div className="space-y-5">
            <motion.div {...sectionMotion} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardHeader className="space-y-2.5">
                  <CropSelector />
                  <div>
                    <CardTitle>
                      {isCrop ? `ความเสี่ยงการปลูก${crop.nameTh}` : "ความเสี่ยงสภาพอากาศ"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {province ? `จังหวัด${province.nameTh} • ช่วง 15 วัน` : ""}
                      {isCrop ? ` • ${variety.nameTh} (${variety.cycleDays} วัน)` : ""}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {ready ? (
                    isCrop ? (
                      <CropRiskPanel crop={crop} variety={variety} days={adjustedDays} />
                    ) : (
                      <RiskGauge
                        total={riskSummary.overall.total}
                        level={riskSummary.overall.level}
                        worstDate={riskSummary.worstDate}
                        components={weatherGaugeComponents}
                      />
                    )
                  ) : (
                    <div className="space-y-3">
                      <Skeleton className="mx-auto h-28 w-52" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...sectionMotion} transition={{ duration: 0.35, delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>จำลองสถานการณ์</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScenarioControls />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* 15-day forecast cards */}
        <motion.section {...sectionMotion} transition={{ duration: 0.35, delay: 0.1 }}>
          <h2 className="mb-3 text-base font-semibold">
            พยากรณ์ 15 วัน{province ? ` — จังหวัด${province.nameTh}` : ""}
          </h2>
          {ready ? (
            <ForecastCards days={adjustedDays} dailyRisk={dailyDots} />
          ) : (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 min-w-[148px]" />
              ))}
            </div>
          )}
        </motion.section>

        {/* Trend chart */}
        <motion.div {...sectionMotion} transition={{ duration: 0.35, delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มรายวัน</CardTitle>
              <CardDescription>
                กราฟเส้นแสดงค่าที่ปรับตามสถานการณ์จำลองแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ready ? (
                <WeatherChart days={adjustedDays} />
              ) : (
                <Skeleton className="h-[280px] w-full" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <footer className="rounded-xl border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {isCrop ? (
            <p>
              <span className="font-medium text-foreground">วิธีคิดความเสี่ยงการปลูก{crop.nameTh} (0-100):</span>{" "}
              {crop.scoringNoteTh} คะแนนรวม = ปัจจัยที่รุนแรงที่สุดในวันที่เสี่ยงที่สุด •
              เขียว = ต่ำ (0-33), เหลือง = ปานกลาง (34-66), แดง = สูง (67-100) •
              ประเมินได้เฉพาะระยะที่อยู่ในช่วงพยากรณ์ 15 วันเท่านั้น •
              คำแนะนำปุ๋ย/โรค-แมลงเป็นแนวทางทั่วไป ควรยึดฉลากและเกษตรอำเภอ/กรมวิชาการเกษตร
            </p>
          ) : (
            <p>
              <span className="font-medium text-foreground">วิธีคำนวณคะแนนความเสี่ยงสภาพอากาศ (0-100):</span>{" "}
              ถ่วงน้ำหนักจากฝนตกหนัก 40% อากาศร้อน 35% และลมแรง 25% อิงเกณฑ์เตือนภัยของกรมอุตุนิยมวิทยา
              (ฝน &gt;35 มม. = หนัก, &gt;90 มม. = หนักมาก • อุณหภูมิ ≥35°C = ร้อน, ≥40°C = ร้อนจัด • ลม ≥62 กม./ชม. = แรง)
              คะแนนรวมคือวันที่เสี่ยงสูงสุดในช่วง 15 วัน • เขียว = ต่ำ (0-33), เหลือง = ปานกลาง (34-66), แดง = สูง (67-100)
            </p>
          )}
          <p className="mt-1">
            ข้อมูลพยากรณ์จาก Open-Meteo.com • เครื่องมือนี้ใช้เพื่อการจำลองสถานการณ์และวางแผน
            ไม่ใช่คำเตือนภัยอย่างเป็นทางการ • รองรับพืชไร่หลัก: ข้าว อ้อย มันสำปะหลัง ข้าวโพดเลี้ยงสัตว์
          </p>
        </footer>
      </main>
    </div>
  );
}
