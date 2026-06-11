// WMO weather interpretation codes (used by Open-Meteo) mapped to Thai labels
// and an icon key consumed by the UI layer.

export type WeatherIconKey =
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "storm";

export interface WeatherCodeInfo {
  labelTh: string;
  icon: WeatherIconKey;
}

export function describeWeatherCode(code: number): WeatherCodeInfo {
  if (code === 0) return { labelTh: "ท้องฟ้าแจ่มใส", icon: "sun" };
  if (code === 1 || code === 2) return { labelTh: "มีเมฆบางส่วน", icon: "cloud-sun" };
  if (code === 3) return { labelTh: "เมฆมาก", icon: "cloud" };
  if (code === 45 || code === 48) return { labelTh: "หมอก", icon: "fog" };
  if (code >= 51 && code <= 57) return { labelTh: "ฝนปรอยๆ", icon: "drizzle" };
  if (code >= 61 && code <= 65) return { labelTh: "ฝนตก", icon: "rain" };
  // Codes 66-77 (freezing rain / snow) cannot occur in Thailand's climate;
  // they are kept only so the WMO table stays complete and crash-proof.
  if (code === 66 || code === 67) return { labelTh: "ฝนเยือกแข็ง", icon: "rain" };
  if (code >= 71 && code <= 77) return { labelTh: "หิมะ", icon: "fog" };
  if (code >= 80 && code <= 81) return { labelTh: "ฝนซู่", icon: "rain" };
  if (code === 82) return { labelTh: "ฝนตกหนักมาก", icon: "heavy-rain" };
  if (code >= 95) return { labelTh: "พายุฝนฟ้าคะนอง", icon: "storm" };
  return { labelTh: "เมฆเป็นส่วนมาก", icon: "cloud" };
}
