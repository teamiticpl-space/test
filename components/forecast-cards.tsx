"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { DailyForecast, RiskLevel } from "@/lib/types";
import { describeWeatherCode, type WeatherIconKey } from "@/lib/weather-codes";
import { RISK_LEVEL_INFO } from "@/lib/risk/risk-engine";
import { formatThaiDate, isToday } from "@/lib/utils";
import { cn } from "@/lib/utils";

const WEATHER_ICONS: Record<WeatherIconKey, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  "heavy-rain": CloudRainWind,
  storm: CloudLightning,
};

const ICON_COLORS: Record<WeatherIconKey, string> = {
  sun: "text-amber-500",
  "cloud-sun": "text-amber-400",
  cloud: "text-slate-400",
  fog: "text-slate-400",
  drizzle: "text-sky-400",
  rain: "text-sky-500",
  "heavy-rain": "text-sky-600",
  storm: "text-indigo-500",
};

interface ForecastCardsProps {
  days: DailyForecast[];
  dailyRisk: Array<{ date: string; total: number; level: RiskLevel }>;
}

export function ForecastCards({ days, dailyRisk }: ForecastCardsProps) {
  const riskByDate = new Map(dailyRisk.map((d) => [d.date, d]));

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
      {days.map((day, index) => {
        const info = describeWeatherCode(day.weatherCode);
        const Icon = WEATHER_ICONS[info.icon];
        const risk = riskByDate.get(day.date);
        const today = isToday(day.date);
        return (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.6), ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className={cn(
              "min-w-[148px] shrink-0 rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md",
              today ? "border-primary/60 ring-1 ring-primary/30" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn("text-xs font-semibold", today ? "text-primary" : "text-muted-foreground")}>
                {today ? "วันนี้" : formatThaiDate(day.date)}
              </p>
              {risk && (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  title={`คะแนนความเสี่ยง ${risk.total}`}
                  style={{ backgroundColor: RISK_LEVEL_INFO[risk.level].color }}
                />
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Icon className={cn("h-8 w-8", ICON_COLORS[info.icon])} strokeWidth={1.7} />
              <div>
                <p className="text-lg font-bold leading-tight">
                  {Math.round(day.tempMax)}°
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {Math.round(day.tempMin)}°
                  </span>
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">{info.labelTh}</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-sky-500" /> ฝน
                </span>
                <span className="font-medium text-foreground">{day.rainfall.toFixed(1)} มม.</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-teal-500" /> ลม
                </span>
                <span className="font-medium text-foreground">{Math.round(day.windSpeed)} กม./ชม.</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-cyan-500" /> ความชื้น
                </span>
                <span className="font-medium text-foreground">{Math.round(day.humidity)}%</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
