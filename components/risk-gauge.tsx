"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { RiskLevel } from "@/lib/types";
import { RISK_LEVEL_INFO } from "@/lib/risk/risk-engine";
import { formatThaiDate } from "@/lib/utils";

export interface GaugeComponentItem {
  labelTh: string;
  value: number;
  color: string;
  icon: LucideIcon;
}

interface RiskGaugeProps {
  total: number;
  level: RiskLevel;
  worstDate: string;
  components: GaugeComponentItem[];
}

// Semicircular arc geometry: radius 80, centered at (100, 100)
const ARC_LENGTH = Math.PI * 80;

export function RiskGauge({ total, level, worstDate, components }: RiskGaugeProps) {
  const info = RISK_LEVEL_INFO[level];
  const offset = ARC_LENGTH * (1 - total / 100);

  return (
    <div>
      <div className="relative mx-auto w-full max-w-[240px]">
        <svg viewBox="0 0 200 112" className="w-full">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={info.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            initial={{ strokeDashoffset: ARC_LENGTH }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold tabular-nums"
            style={{ color: info.color }}
          >
            {total}
          </motion.p>
          <p className="text-xs text-muted-foreground">จาก 100 คะแนน</p>
        </div>
      </div>

      <p className="mt-2 text-center text-sm font-semibold" style={{ color: info.color }}>
        {info.labelTh}
      </p>
      {worstDate && (
        <p className="mt-0.5 text-center text-xs text-muted-foreground">
          วันที่เสี่ยงสูงสุด: {formatThaiDate(worstDate)}
        </p>
      )}

      <div className="mt-4 space-y-2.5">
        {components.map((c) => (
          <div key={c.labelTh}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <c.icon className="h-3.5 w-3.5" style={{ color: c.color }} />
                {c.labelTh}
              </span>
              <span className="font-medium tabular-nums">{c.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.color }}
                initial={{ width: 0 }}
                animate={{ width: `${c.value}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
