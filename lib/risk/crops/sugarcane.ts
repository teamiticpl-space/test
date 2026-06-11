import type { CropModel, ProtectionAlert, ProtectionContext } from "@/lib/risk/crops/types";

// อ้อย (sugarcane) — อายุ ~10-12 เดือน. Wants water during grand-growth
// (ย่างปล้อง) and dry+cool weather while ripening to accumulate sugar.
// Basis: DOA / sugarcane research center guidance.

function buildProtection({ stats, stages, variety }: ProtectionContext): ProtectionAlert[] {
  const alerts: ProtectionAlert[] = [];
  const susceptibleRedRot = variety.id === "kps92";

  // หนอนกออ้อย (sugarcane stalk borer) — outbreaks in hot, dry spells
  if (stats.rainTotal < 25 && stats.maxTemp >= 33 && (stages.has("tillering") || stages.has("elongation"))) {
    alerts.push({
      id: "stalkborer",
      threatTh: "หนอนกออ้อย",
      causeTh: `อากาศร้อนแล้ง (สูงสุด ${Math.round(stats.maxTemp)}°C, ฝนน้อย ~${Math.round(stats.rainTotal)} มม.) เร่งการระบาด`,
      severity: "moderate",
      actionTh:
        "สำรวจยอดเหี่ยว (dead heart) สม่ำเสมอ ใช้แตนเบียนไข่/หนอน (เช่น แตนเบียนไตรโคแกรมมา) ปล่อยตามคำแนะนำ และให้น้ำลดความเครียดจากแล้ง เลี่ยงเผาใบที่ทำลายศัตรูธรรมชาติ",
    });
  }

  // โรคเหี่ยวเน่าแดง (red rot) — fungal, favored by warm humid + wounds
  if (stats.humidityMean >= 80 && (stages.has("elongation") || stages.has("tillering"))) {
    alerts.push({
      id: "redrot",
      threatTh: "โรคเหี่ยวเน่าแดง",
      causeTh: `ความชื้นสูง (เฉลี่ย ${Math.round(stats.humidityMean)}%) เอื้อต่อเชื้อราเข้าทางแผล/รอยเจาะของหนอน`,
      severity: susceptibleRedRot ? "high" : "moderate",
      actionTh:
        "ใช้ท่อนพันธุ์สะอาดปลอดโรค ระบายน้ำไม่ให้แฉะ ควบคุมหนอนเจาะลำที่เปิดแผล หากพบลำแดงเน่ากลิ่นเปรี้ยวให้กำจัดกอที่เป็นโรคทันที การใช้สารป้องกันเชื้อราต้องปรึกษาเกษตรอำเภอ/กรมวิชาการเกษตรและใช้ตามฉลากเท่านั้น",
    });
  }

  // น้ำท่วมขังช่วงสะสมน้ำตาล ลดค่าความหวาน
  if (stats.rainTotal >= 90 && stages.has("ripening")) {
    alerts.push({
      id: "waterlog-ripen",
      threatTh: "น้ำขังช่วงสะสมน้ำตาล",
      causeTh: `ฝนสะสมมาก (~${Math.round(stats.rainTotal)} มม.) ช่วงอ้อยควรการแล้งเพื่อสะสมน้ำตาล`,
      severity: "moderate",
      actionTh: "เร่งระบายน้ำออกจากแปลง งดให้น้ำ/ปุ๋ยไนโตรเจนช่วงนี้ เพื่อรักษาค่าความหวาน (C.C.S.)",
    });
  }

  return alerts;
}

export const SUGARCANE: CropModel = {
  id: "sugarcane",
  nameTh: "อ้อย",
  nameEn: "Sugarcane",
  iconKey: "sprout",
  accent: "#65a30d",
  plantVerbTh: "ปลูก",
  plantingLabelTh: "วันที่ปลูกอ้อย",
  defaultVarietyId: "kk3",
  varieties: [
    { id: "kk3", nameTh: "ขอนแก่น 3", nameEn: "Khon Kaen 3", subtypeTh: "พันธุ์กลาง ทนแล้ง", cycleDays: 345, heatFactor: 0.95, coldFactor: 1.0, noteTh: "พันธุ์นิยมสูงสุด ทนแล้งดี ค่าความหวานสูง" },
    { id: "lk92", nameTh: "แอลเค 92-11", nameEn: "LK92-11", subtypeTh: "ผลผลิตสูง", cycleDays: 360, heatFactor: 1.0, coldFactor: 1.0, noteTh: "ผลผลิตสูง ไว้ตอได้ดี ต้องการน้ำสม่ำเสมอ" },
    { id: "sp50", nameTh: "สุพรรณบุรี 50", nameEn: "Suphanburi 50", subtypeTh: "พันธุ์กลาง", cycleDays: 350, heatFactor: 1.0, coldFactor: 1.0, noteTh: "แตกกอดี เหมาะดินร่วน-ดินเหนียว" },
    { id: "kps92", nameTh: "กำแพงแสน 92-0447", nameEn: "KPS 92-0447", subtypeTh: "อ่อนแอเหี่ยวเน่าแดง", cycleDays: 360, heatFactor: 1.0, coldFactor: 1.0, noteTh: "ผลผลิตดี แต่ค่อนข้างอ่อนแอต่อโรคเหี่ยวเน่าแดง ควรใช้ท่อนพันธุ์สะอาด" },
  ],
  stages: [
    { id: "germination", labelTh: "งอก/ตั้งตัว", endFraction: 0.1, sensitivity: { flood: 0.7, drought: 0.8, heat: 0.3, wind: 0.1, cold: 0.3 } },
    { id: "tillering", labelTh: "แตกกอ", endFraction: 0.3, sensitivity: { flood: 0.4, drought: 0.7, heat: 0.4, wind: 0.2, cold: 0.3 } },
    { id: "elongation", labelTh: "ย่างปล้อง/ยืดปล้อง", endFraction: 0.7, sensitivity: { flood: 0.6, drought: 1.0, heat: 0.6, wind: 0.6, cold: 0.4 } },
    { id: "ripening", labelTh: "สุกแก่/สะสมน้ำตาล", endFraction: 1.0, sensitivity: { flood: 0.7, drought: 0.1, heat: 0.3, wind: 0.7, cold: 0.1 } },
  ],
  factorLabels: {
    flood: "ฝนหนัก/น้ำท่วม",
    drought: "ฝนทิ้งช่วง/ขาดน้ำ",
    heat: "อากาศร้อนจัด",
    wind: "ลมแรง (อ้อยล้ม)",
    cold: "อากาศเย็นจัด",
  },
  factorAdvice: {
    drought: {
      tillering: "อ้อยแตกกอเจอแล้ง จำนวนลำต่อกอจะน้อยลง ควรให้น้ำถ้าทำได้",
      elongation: "ระยะย่างปล้องต้องการน้ำมากที่สุด ขาดน้ำช่วงนี้ลำเล็ก น้ำหนักลด ควรให้น้ำสม่ำเสมอ",
    },
    flood: {
      germination: "น้ำขังหลังปลูกทำให้ท่อนพันธุ์เน่า ควรยกร่อง/ระบายน้ำ",
      ripening: "น้ำขังช่วงสะสมน้ำตาลลดค่าความหวาน ควรระบายน้ำและงดให้น้ำ",
    },
    wind: {
      elongation: "ลมแรงช่วงปล้องยาวเสี่ยงอ้อยล้ม ควรติดตามพยากรณ์",
      ripening: "ลมแรงช่วงใกล้เก็บเกี่ยวเสี่ยงอ้อยล้ม ควรวางแผนตัดเมื่อสุกแก่",
    },
  },
  genericAdvice: {
    flood: "มีช่วงฝนตกหนัก ควรเตรียมร่องระบายน้ำในแปลงอ้อย",
    drought: "มีช่วงฝนทิ้งช่วง ควรวางแผนให้น้ำโดยเฉพาะระยะย่างปล้อง",
    heat: "มีช่วงอากาศร้อนจัด อ้อยเล็กอาจเครียด ควรรักษาความชื้นดิน",
    wind: "มีช่วงลมแรง อ้อยสูงเสี่ยงล้ม ควรติดตามประกาศเตือน",
    cold: "อากาศเย็นช่วงสุกแก่ช่วยสะสมน้ำตาล แต่เย็นจัดช่วงเล็กอาจชะงักการเติบโต",
  },
  fertilizer: {
    clay: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15 หรือ 16-16-8", rateTh: "40-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว แตกกอเร็ว" },
      { stageId: "tillering", timingTh: "แต่งหน้า (ระยะแตกกอ-ย่างปล้อง ~1-3 เดือน)", productTh: "ยูเรีย 46-0-0 หรือ 21-0-0", rateTh: "30-50 กก./ไร่", purposeTh: "เร่งการเจริญเติบโต เพิ่มจำนวนลำ" },
      { stageId: "ripening", timingTh: "บำรุงน้ำตาล (อายุ > 7 เดือน)", productTh: "13-13-21 หรือ 0-0-60 (โพแทส)", rateTh: "25-50 กก./ไร่", purposeTh: "กระตุ้นการสะสมน้ำตาล เพิ่มค่าความหวาน" },
    ],
    loam: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "40-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว แตกกอเร็ว" },
      { stageId: "tillering", timingTh: "แต่งหน้า (ระยะแตกกอ-ย่างปล้อง ~1-3 เดือน)", productTh: "ยูเรีย 46-0-0 หรือ 21-0-0", rateTh: "30-50 กก./ไร่", purposeTh: "เร่งการเจริญเติบโต เพิ่มจำนวนลำ" },
      { stageId: "ripening", timingTh: "บำรุงน้ำตาล (อายุ > 7 เดือน)", productTh: "13-13-21 (เน้นโพแทส)", rateTh: "25-50 กก./ไร่", purposeTh: "เพิ่มค่าความหวาน" },
    ],
    sandy: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "16-16-8 หรือ 15-15-15", rateTh: "40-50 กก./ไร่", purposeTh: "เสริมโพแทสที่ดินทรายมักขาด เร่งตั้งตัว" },
      { stageId: "tillering", timingTh: "แต่งหน้า (แบ่งใส่ 2 ครั้ง ดินทรายชะล้างเร็ว)", productTh: "ยูเรีย 46-0-0 + 13-13-21", rateTh: "รวม ~40-60 กก./ไร่", purposeTh: "เร่งโตและกันการชะล้าง" },
      { stageId: "ripening", timingTh: "บำรุงน้ำตาล (อายุ > 7 เดือน)", productTh: "0-0-60 หรือ 13-13-21", rateTh: "30-50 กก./ไร่", purposeTh: "เพิ่มค่าความหวาน" },
    ],
  },
  fertilizerCaution: (stats) =>
    stats.rainTotal >= 90
      ? "ฝนชุก/น้ำขัง ควรเลื่อนการใส่ปุ๋ยจนกว่าจะระบายน้ำได้ และงดเร่งไนโตรเจนช่วงอ้อยสะสมน้ำตาล"
      : null,
  buildProtection,
  scoringNoteTh:
    "ระบบนับอายุอ้อยจากวันปลูกตามพันธุ์ (อายุ ~11-12 เดือน) แล้วจับคู่ช่วง 15 วันกับระยะ (งอก → แตกกอ → ย่างปล้อง → สุกแก่/สะสมน้ำตาล) อ้อยต้องการน้ำมากช่วงย่างปล้อง แต่ต้องการอากาศแล้ง-เย็นช่วงสุกแก่เพื่อสะสมน้ำตาล",
};
