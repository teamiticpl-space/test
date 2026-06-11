"use client";

import { Badge } from "@/components/ui/badge";
import type { DataSource } from "@/lib/types";

interface DataSourceBadgeProps {
  source: DataSource | null;
  loading: boolean;
}

export function DataSourceBadge({ source, loading }: DataSourceBadgeProps) {
  if (loading) {
    return (
      <Badge variant="outline">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
        กำลังโหลดข้อมูล...
      </Badge>
    );
  }
  if (source === "open-meteo") {
    return (
      <Badge variant="success">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ข้อมูลจริงจาก Open-Meteo
      </Badge>
    );
  }
  if (source === "simulated") {
    return (
      <Badge variant="warning">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ข้อมูลจำลอง (ออฟไลน์)
      </Badge>
    );
  }
  return null;
}
