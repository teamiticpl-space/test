"use client";

import { Carrot, CloudSun, Leaf, Sprout, Wheat, type LucideIcon } from "lucide-react";
import { CROPS } from "@/lib/risk/crops";
import { useWeatherStore } from "@/stores/weather-store";
import { cn } from "@/lib/utils";

// lucide-react has no dedicated corn/cassava icons, so maize uses Leaf and
// cassava uses Carrot (a root crop) as the closest semantic fits.
export const CROP_ICONS: Record<string, LucideIcon> = {
  wheat: Wheat,
  sprout: Sprout,
  carrot: Carrot,
  leaf: Leaf,
};

/**
 * Risk-lens selector: one chip per crop plus a weather chip. Picking a crop
 * sets the crop view; picking weather switches to the general weather lens.
 * A radiogroup of buttons (content is rendered by the parent).
 */
export function CropSelector() {
  const viewMode = useWeatherStore((s) => s.viewMode);
  const cropId = useWeatherStore((s) => s.cropId);
  const setCropId = useWeatherStore((s) => s.setCropId);
  const setViewMode = useWeatherStore((s) => s.setViewMode);

  return (
    <div
      role="radiogroup"
      aria-label="เลือกพืชหรือมุมมองความเสี่ยง"
      className="flex gap-1.5 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none]"
    >
      {CROPS.map((crop) => {
        const Icon = CROP_ICONS[crop.iconKey] ?? Leaf;
        const active = viewMode === "crop" && cropId === crop.id;
        return (
          <button
            key={crop.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setCropId(crop.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {crop.nameTh}
          </button>
        );
      })}
      <span className="mx-0.5 my-1 w-px shrink-0 bg-border" aria-hidden />
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "weather"}
        onClick={() => setViewMode("weather")}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          viewMode === "weather" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <CloudSun className="h-3.5 w-3.5" />
        สภาพอากาศ
      </button>
    </div>
  );
}
