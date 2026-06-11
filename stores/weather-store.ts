import { create } from "zustand";
import type { DailyForecast, DataSource, Scenario } from "@/lib/types";
import { DEFAULT_PROVINCE_ID, PROVINCES } from "@/lib/provinces";
import { fetchAllForecasts, FORECAST_DAYS } from "@/lib/weather-api";
import { generateSimulatedForecasts } from "@/lib/mock-weather";
import { DEFAULT_SCENARIO } from "@/lib/scenario";
import { todayIso } from "@/lib/utils";
import { DEFAULT_CROP_ID, getCrop, type SoilType } from "@/lib/risk/crops";

export type ViewMode = "crop" | "weather";

interface WeatherState {
  selectedProvinceId: string;
  scenario: Scenario;
  /** Base (unadjusted) 15-day forecasts keyed by province id */
  data: Record<string, DailyForecast[]> | null;
  source: DataSource | null;
  loading: boolean;
  error: string | null;
  /** Crop yield-risk lens vs general weather risk */
  viewMode: ViewMode;
  /** Selected crop id (rice / sugarcane / cassava / maize) */
  cropId: string;
  /** Variety id within the selected crop */
  varietyId: string;
  /** Soil type for fertilizer guidance (a field property, shared across crops) */
  soilType: SoilType;
  /** Planting/sowing date (ISO) used by crop risk mode */
  plantingDate: string;

  selectProvince: (id: string) => void;
  setScenario: (partial: Partial<Scenario>) => void;
  resetScenario: () => void;
  setViewMode: (mode: ViewMode) => void;
  setCropId: (id: string) => void;
  setVarietyId: (id: string) => void;
  setSoilType: (soil: SoilType) => void;
  setPlantingDate: (iso: string) => void;
  loadAll: () => Promise<void>;
}

function defaultVarietyFor(cropId: string): string {
  return getCrop(cropId)?.defaultVarietyId ?? "";
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  selectedProvinceId: DEFAULT_PROVINCE_ID,
  scenario: DEFAULT_SCENARIO,
  data: null,
  source: null,
  loading: false,
  error: null,
  viewMode: "crop",
  cropId: DEFAULT_CROP_ID,
  varietyId: defaultVarietyFor(DEFAULT_CROP_ID),
  soilType: "clay",
  plantingDate: todayIso(),

  selectProvince: (id) => set({ selectedProvinceId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setCropId: (id) =>
    // Switching crop resets the variety to that crop's default and re-enters
    // crop view (so picking a crop from the selector always shows crop risk).
    set({ cropId: id, varietyId: defaultVarietyFor(id), viewMode: "crop" }),

  setVarietyId: (id) => set({ varietyId: id }),

  setSoilType: (soil) => set({ soilType: soil }),

  setPlantingDate: (iso) => {
    if (iso) set({ plantingDate: iso });
  },

  setScenario: (partial) =>
    set((state) => ({ scenario: { ...state.scenario, ...partial } })),

  resetScenario: () => set({ scenario: DEFAULT_SCENARIO }),

  loadAll: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const data = await fetchAllForecasts(PROVINCES);
      set({ data, source: "open-meteo", loading: false });
    } catch {
      const data = generateSimulatedForecasts(PROVINCES, FORECAST_DAYS);
      set({
        data,
        source: "simulated",
        loading: false,
        error: "เชื่อมต่อ Open-Meteo ไม่ได้ ระบบจึงใช้ข้อมูลจำลองตามฤดูกาลแทน",
      });
    }
  },
}));
