import type { CropModel, ProtectionAlert, ProtectionContext } from "@/lib/risk/crops/types";

// ข้าวโพดเลี้ยงสัตว์ (field maize) — อายุ ~100-120 วัน. Extremely sensitive to
// drought + heat at tasseling/silking (ออกไหม); fall armyworm is the key pest.
// Basis: DOA Nakhon Sawan field-crop research / extension guidance.

function buildProtection({ stats, stages }: ProtectionContext): ProtectionAlert[] {
  const alerts: ProtectionAlert[] = [];

  // หนอนกระทู้ข้าวโพดลายจุด (fall armyworm) — primary maize pest, worst early
  if (stages.has("germination") || stages.has("vegetative")) {
    const dryHot = stats.rainTotal < 25 && stats.maxTemp >= 33;
    alerts.push({
      id: "faw",
      threatTh: "หนอนกระทู้ข้าวโพดลายจุด",
      causeTh: dryHot
        ? `อากาศร้อนแล้ง (สูงสุด ${Math.round(stats.maxTemp)}°C) เร่งการระบาด ระยะต้นเล็กเสียหายเร็ว`
        : "เป็นศัตรูสำคัญของข้าวโพด ทำลายตั้งแต่ข้าวโพดอายุ 1 สัปดาห์",
      severity: "high",
      actionTh:
        "สำรวจยอด/ใบที่มีรอยกัดและมูลทุก 3-5 วัน เริ่มด้วยชีวภัณฑ์ (เชื้อบีที/ไวรัส NPV) พ่นช่วงเย็นที่หนอนออกหากิน อนุรักษ์แมลงห้ำ-เบียน ใช้สารเคมีต่อเมื่อพบความเสียหายเกินระดับเศรษฐกิจ (ยอดถูกทำลาย ~20%) ตามคำแนะนำกรมวิชาการเกษตรและฉลาก หมุนเวียนกลุ่มสาร",
    });
  }

  // หนอนเจาะลำต้น/ฝัก (stem & ear borer)
  if (stats.maxTemp >= 32 && (stages.has("vegetative") || stages.has("silking"))) {
    alerts.push({
      id: "stemborer",
      threatTh: "หนอนเจาะลำต้น/ฝัก",
      causeTh: "อากาศอุ่นเอื้อต่อหนอนเจาะลำต้นและฝัก โดยเฉพาะช่วงออกดอก-ติดฝัก",
      severity: "moderate",
      actionTh: "สำรวจรูเจาะที่ลำต้นและฝัก ใช้แตนเบียนไข่/สารชีวภัณฑ์ก่อน หากเกินระดับเศรษฐกิจใช้สารตามฉลาก",
    });
  }

  // ราฝัก/โรคฝักเน่า (ear rot) — wet weather near maturity
  if (stats.rainTotal >= 50 && (stages.has("grainFilling") || stages.has("maturity"))) {
    alerts.push({
      id: "earrot",
      threatTh: "โรคฝักเน่า/ราฝัก",
      causeTh: `ฝนชุก (~${Math.round(stats.rainTotal)} มม.) ช่วงติดเมล็ด-แก่ ทำให้ฝักชื้นและเกิดรา`,
      severity: "moderate",
      actionTh: "เร่งวางแผนเก็บเกี่ยวเมื่อฝักแก่จัดก่อนฝนรอบใหม่ ตากฝัก/ลดความชื้นเมล็ดให้เร็ว เก็บในที่แห้งอากาศถ่ายเท เพื่อลดการเกิดราและสารพิษจากเชื้อรา",
    });
  }

  return alerts;
}

export const MAIZE: CropModel = {
  id: "maize",
  nameTh: "ข้าวโพดเลี้ยงสัตว์",
  nameEn: "Field Maize",
  iconKey: "leaf",
  accent: "#d97706",
  plantVerbTh: "ปลูก",
  plantingLabelTh: "วันที่ปลูกข้าวโพด",
  defaultVarietyId: "hybrid-mid",
  varieties: [
    { id: "hybrid-early", nameTh: "ลูกผสมอายุสั้น", nameEn: "Early hybrid", subtypeTh: "ลูกผสม ~100 วัน", cycleDays: 100, heatFactor: 1.0, coldFactor: 1.0, noteTh: "อายุสั้น เก็บเกี่ยวเร็ว เหมาะปลูกหนีแล้ง/ปลูกหลังนา" },
    { id: "hybrid-mid", nameTh: "ลูกผสมทั่วไป", nameEn: "Standard hybrid", subtypeTh: "ลูกผสม ~115 วัน", cycleDays: 115, heatFactor: 1.0, coldFactor: 1.0, noteTh: "พันธุ์ลูกผสมที่นิยมปลูก ผลผลิตสูง ต้องการน้ำสม่ำเสมอช่วงออกไหม" },
    { id: "ns3", nameTh: "นครสวรรค์ 3", nameEn: "Nakhon Sawan 3", subtypeTh: "พันธุ์ผสมเปิด ~120 วัน", cycleDays: 120, heatFactor: 1.0, coldFactor: 1.0, noteTh: "พันธุ์แนะนำกรมวิชาการเกษตร เก็บเมล็ดพันธุ์ใช้เองได้" },
  ],
  stages: [
    { id: "germination", labelTh: "งอก/ต้นกล้า", endFraction: 0.13, sensitivity: { flood: 0.7, drought: 0.7, heat: 0.3, wind: 0.2, cold: 0.3 } },
    { id: "vegetative", labelTh: "เจริญต้น-ใบ", endFraction: 0.45, sensitivity: { flood: 0.5, drought: 0.6, heat: 0.4, wind: 0.4, cold: 0.3 } },
    { id: "silking", labelTh: "ออกดอก/ออกไหม", endFraction: 0.65, sensitivity: { flood: 0.7, drought: 1.0, heat: 1.0, wind: 0.7, cold: 0.5 } },
    { id: "grainFilling", labelTh: "ติดเมล็ด", endFraction: 0.9, sensitivity: { flood: 0.5, drought: 0.7, heat: 0.7, wind: 0.6, cold: 0.3 } },
    { id: "maturity", labelTh: "แก่จัด/เก็บเกี่ยว", endFraction: 1.0, sensitivity: { flood: 0.9, drought: 0.1, heat: 0.2, wind: 0.8, cold: 0.1 } },
  ],
  factorLabels: {
    flood: "ฝนหนัก/น้ำท่วม",
    drought: "ฝนทิ้งช่วง/ขาดน้ำ",
    heat: "อากาศร้อนจัด",
    wind: "ลมแรง (ต้นล้ม)",
    cold: "อากาศเย็นจัด",
  },
  factorAdvice: {
    drought: {
      silking: "ขาดน้ำช่วงออกไหมเป็นช่วงวิกฤตที่สุด ทำให้ผสมไม่ติด เมล็ดไม่เต็มฝัก ถ้าให้น้ำได้ต้องให้ช่วงนี้ก่อน",
      grainFilling: "ขาดน้ำช่วงติดเมล็ดทำให้เมล็ดลีบ น้ำหนักลด ควรให้น้ำถ้าทำได้",
    },
    heat: {
      silking: "อากาศร้อนจัดช่วงออกไหมทำให้ละอองเกสรเสียหาย ผสมไม่ติด ควรให้น้ำเพื่อลดความเครียดและเลี่ยงปลูกให้ออกไหมตรงช่วงร้อนสุด",
    },
    flood: {
      maturity: "ฝนช่วงฝักแก่ทำให้ฝักชื้นเกิดรา ควรเร่งเก็บเกี่ยวเมื่อแก่จัดและตากให้แห้ง",
    },
    wind: {
      grainFilling: "ลมแรงช่วงติดฝักเสี่ยงต้นล้ม ควรติดตามพยากรณ์",
      maturity: "ลมแรงช่วงใกล้เก็บเกี่ยวเสี่ยงต้นล้มฝักเสียหาย ควรวางแผนเก็บเกี่ยว",
    },
  },
  genericAdvice: {
    flood: "มีช่วงฝนตกหนัก ข้าวโพดไม่ทนน้ำขัง ควรเตรียมร่องระบายน้ำ",
    drought: "มีช่วงฝนทิ้งช่วง ควรวางแผนน้ำให้พอ โดยเฉพาะช่วงออกไหม",
    heat: "มีช่วงอากาศร้อนจัด เสี่ยงช่วงออกไหม ควรรักษาความชื้นดิน",
    wind: "มีช่วงลมแรง ต้นข้าวโพดเสี่ยงล้ม ควรติดตามประกาศเตือน",
    cold: "อากาศเย็นจัดอาจชะลอการเติบโตและการออกดอก",
  },
  fertilizer: {
    clay: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "40-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว" },
      { stageId: "vegetative", timingTh: "แต่งหน้าครั้งที่ 1 (อายุ ~25-30 วัน)", productTh: "ยูเรีย 46-0-0", rateTh: "20-25 กก./ไร่", purposeTh: "เร่งการเจริญต้น-ใบ" },
      { stageId: "silking", timingTh: "แต่งหน้าครั้งที่ 2 (ก่อนออกดอก ~45 วัน)", productTh: "ยูเรีย 46-0-0 หรือ 15-15-15", rateTh: "15-25 กก./ไร่", purposeTh: "เพิ่มการติดเมล็ดและน้ำหนักฝัก" },
    ],
    loam: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "40-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว" },
      { stageId: "vegetative", timingTh: "แต่งหน้าครั้งที่ 1 (อายุ ~25-30 วัน)", productTh: "ยูเรีย 46-0-0", rateTh: "20-25 กก./ไร่", purposeTh: "เร่งการเจริญต้น-ใบ" },
      { stageId: "silking", timingTh: "แต่งหน้าครั้งที่ 2 (ก่อนออกดอก ~45 วัน)", productTh: "ยูเรีย 46-0-0 หรือ 15-15-15", rateTh: "15-25 กก./ไร่", purposeTh: "เพิ่มการติดเมล็ด" },
    ],
    sandy: [
      { stageId: "germination", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "40-50 กก./ไร่", purposeTh: "เร่งตั้งตัวในดินทราย" },
      { stageId: "vegetative", timingTh: "แต่งหน้า (แบ่งใส่ ดินทรายชะล้างเร็ว)", productTh: "ยูเรีย 46-0-0 + 15-15-15", rateTh: "รวม ~35-45 กก./ไร่", purposeTh: "เร่งโตและกันการชะล้าง" },
      { stageId: "silking", timingTh: "แต่งหน้าก่อนออกดอก", productTh: "15-15-15 (มีโพแทส)", rateTh: "20-25 กก./ไร่", purposeTh: "เพิ่มการติดเมล็ดและความแข็งแรงของต้น" },
    ],
  },
  buildProtection,
  scoringNoteTh:
    "ระบบนับอายุข้าวโพดจากวันปลูกตามพันธุ์ (อายุ ~100-120 วัน) แล้วจับคู่ช่วง 15 วันกับระยะ (งอก → เจริญต้น-ใบ → ออกไหม → ติดเมล็ด → แก่จัด) ช่วงออกไหมเป็นช่วงวิกฤตที่สุด ขาดน้ำหรือร้อนจัดช่วงนี้ทำให้ผสมไม่ติด เมล็ดไม่เต็มฝัก",
};
