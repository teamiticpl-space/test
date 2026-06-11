import type { CropModel, CropVariety } from "@/lib/risk/crops/types";
import { RICE } from "@/lib/risk/crops/rice";
import { SUGARCANE } from "@/lib/risk/crops/sugarcane";
import { CASSAVA } from "@/lib/risk/crops/cassava";
import { MAIZE } from "@/lib/risk/crops/maize";

export const CROPS: CropModel[] = [RICE, SUGARCANE, CASSAVA, MAIZE];

export const DEFAULT_CROP_ID = "rice";

const cropMap = new Map(CROPS.map((c) => [c.id, c]));

export function getCrop(id: string): CropModel | undefined {
  return cropMap.get(id);
}

export function defaultCrop(): CropModel {
  return getCrop(DEFAULT_CROP_ID) ?? CROPS[0];
}

/** Resolve a variety within a crop, falling back to the crop's default. */
export function getCropVariety(crop: CropModel, varietyId: string | undefined): CropVariety {
  if (varietyId) {
    const found = crop.varieties.find((v) => v.id === varietyId);
    if (found) return found;
  }
  return (
    crop.varieties.find((v) => v.id === crop.defaultVarietyId) ?? crop.varieties[0]
  );
}

export * from "@/lib/risk/crops/types";
