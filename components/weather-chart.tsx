"use client";

import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyForecast } from "@/lib/types";
import { formatThaiDateShort } from "@/lib/utils";

interface WeatherChartProps {
  days: DailyForecast[];
}

const CHART_HEIGHT = 280;

/**
 * Measure the wrapper's width ourselves instead of relying on recharts'
 * ResponsiveContainer: when its first measurement is 0 (collapsed panel,
 * hidden tab) it never recovers, leaving a blank chart. Observing our own
 * always-visible wrapper guarantees the chart redraws on any size change.
 */
function useMeasuredWidth(): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export function WeatherChart({ days }: WeatherChartProps) {
  const [wrapperRef, width] = useMeasuredWidth();

  const chartData = days.map((d) => ({
    date: formatThaiDateShort(d.date),
    สูงสุด: d.tempMax,
    ต่ำสุด: d.tempMin,
    ปริมาณฝน: d.rainfall,
    ความเร็วลม: d.windSpeed,
    ความชื้น: d.humidity,
  }));

  const axisStyle = { fontSize: 11, fill: "#64748b" };
  const margin = { top: 8, right: 12, left: -8, bottom: 0 };
  const canDraw = width > 0;

  return (
    <div ref={wrapperRef} className="w-full">
      <Tabs defaultValue="temp">
        <TabsList>
          <TabsTrigger value="temp">อุณหภูมิ</TabsTrigger>
          <TabsTrigger value="rain">ปริมาณฝน</TabsTrigger>
          <TabsTrigger value="wind">ความเร็วลม</TabsTrigger>
          <TabsTrigger value="humidity">ความชื้น</TabsTrigger>
        </TabsList>

        <TabsContent value="temp">
          {canDraw && (
            <LineChart width={width} height={CHART_HEIGHT} data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={axisStyle} tickMargin={6} />
              <YAxis tick={axisStyle} unit="°" width={44} />
              <ChartTooltip formatter={(value) => [`${value} °C`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="สูงสุด" stroke="#f97316" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="ต่ำสุด" stroke="#0284c7" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          )}
        </TabsContent>

        <TabsContent value="rain">
          {canDraw && (
            <LineChart width={width} height={CHART_HEIGHT} data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={axisStyle} tickMargin={6} />
              <YAxis tick={axisStyle} width={44} />
              <ChartTooltip formatter={(value) => [`${value} มม.`]} />
              <Line type="monotone" dataKey="ปริมาณฝน" stroke="#2563eb" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          )}
        </TabsContent>

        <TabsContent value="wind">
          {canDraw && (
            <LineChart width={width} height={CHART_HEIGHT} data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={axisStyle} tickMargin={6} />
              <YAxis tick={axisStyle} width={44} />
              <ChartTooltip formatter={(value) => [`${value} กม./ชม.`]} />
              <Line type="monotone" dataKey="ความเร็วลม" stroke="#0d9488" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          )}
        </TabsContent>

        <TabsContent value="humidity">
          {canDraw && (
            <LineChart width={width} height={CHART_HEIGHT} data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={axisStyle} tickMargin={6} />
              <YAxis tick={axisStyle} unit="%" domain={[0, 100]} width={44} />
              <ChartTooltip formatter={(value) => [`${value}%`]} />
              <Line type="monotone" dataKey="ความชื้น" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
