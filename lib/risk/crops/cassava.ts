import type { CropModel, ProtectionAlert, ProtectionContext } from "@/lib/risk/crops/types";

// มันสำปะหลัง (cassava) — อายุ ~8-12 เดือน. Drought-tolerant but hates
// waterlogging (root rot) and is hit by mealybug/mites in dry spells.
// Basis: DOA / cassava extension guidance.

function buildProtection({ stats, stages }: ProtectionContext): ProtectionAlert[] {
  const alerts: ProtectionAlert[] = [];
  const growing = stages.has("sprouting") || stages.has("canopy") || stages.has("bulking");

  // เพลี้ยแป้งมันสำปะหลัง (cassava mealybug) — outbreaks in dry spells
  if (stats.rainTotal < 20 && growing) {
    alerts.push({
      id: "mealybug",
      threatTh: "เพลี้ยแป้งมันสำปะหลัง",
      causeTh: `ฝนทิ้งช่วง (~${Math.round(stats.rainTotal)} มม.) เอื้อต่อการระบาดของเพลี้ยแป้ง`,
      severity: "moderate",
      actionTh:
        "สำรวจยอดที่หงิกงอ/มีคราบขาวทุก 1-2 สัปดาห์ ปล่อยแตนเบียน/แมลงช้างปีกใส (ศัตรูธรรมชาติ) งดให้ปุ๋ยไนโตรเจนเร่งยอดช่วงแล้ง หากระบาดเกินระดับเศรษฐกิจใช้สารตามคำแนะนำกรมวิชาการเกษตรและฉลาก",
    });
  }

  // ไรแดง (red spider mite) — hot and very dry
  if (stats.rainTotal < 10 && stats.maxTemp >= 34 && growing) {
    alerts.push({
      id: "redmite",
      threatTh: "ไรแดง",
      causeTh: `อากาศร้อนแล้งจัด (สูงสุด ${Math.round(stats.maxTemp)}°C) เร่งการระบาดของไรแดง`,
      severity: "moderate",
      actionTh: "สำรวจใต้ใบที่มีจุดเหลือง/ใยบาง ฉีดน้ำเพิ่มความชื้น อนุรักษ์ไรตัวห้ำ หากรุนแรงใช้สารกำจัดไรตามคำแนะนำ",
    });
  }

  // โรคใบด่างมันสำปะหลัง (CMD) via whitefly — warm dry favors the vector
  if (stats.maxTemp >= 33 && stats.rainTotal < 25 && (stages.has("sprouting") || stages.has("canopy"))) {
    alerts.push({
      id: "cmd",
      threatTh: "เฝ้าระวังโรคใบด่าง (แมลงหวี่ขาวพาหะ)",
      causeTh: "อากาศร้อนแล้งเอื้อต่อแมลงหวี่ขาวที่เป็นพาหะของไวรัสใบด่าง",
      severity: "moderate",
      actionTh:
        "ป้องกันก่อนติดเชื้อสำคัญที่สุด เพราะต้นที่แสดงใบด่างแล้วรักษาไม่ได้ — สำรวจแมลงหวี่ขาว/ใบด่างทุก 1-2 สัปดาห์ตั้งแต่ระยะกล้า ใช้กับดักกาวเหลืองดักแมลงหวี่ขาว ควบคุมพาหะตั้งแต่ยังไม่พบอาการตามคำแนะนำกรมวิชาการเกษตร และถอนทำลายต้นที่เป็นโรคทันที",
    });
  }

  // น้ำขังช่วงลงหัว/สะสมแป้ง เสี่ยงหัวเน่า
  if (stats.rainTotal >= 80 && (stages.has("bulking") || stages.has("starch"))) {
    alerts.push({
      id: "rootrot",
      threatTh: "หัวเน่า/โคนเน่าจากน้ำขัง",
      causeTh: `ฝนสะสมมาก (~${Math.round(stats.rainTotal)} มม.) มันสำปะหลังไม่ทนน้ำขัง`,
      severity: "high",
      actionTh: "เร่งระบายน้ำออกจากแปลง ยกร่องปลูกในพื้นที่ลุ่ม เลี่ยงปลูกซ้ำในแปลงที่เคยมีโรคหัวเน่า",
    });
  }

  return alerts;
}

export const CASSAVA: CropModel = {
  id: "cassava",
  nameTh: "มันสำปะหลัง",
  nameEn: "Cassava",
  iconKey: "carrot",
  accent: "#b45309",
  plantVerbTh: "ปลูก",
  plantingLabelTh: "วันที่ปลูกมันสำปะหลัง",
  defaultVarietyId: "rayong9",
  varieties: [
    { id: "rayong9", nameTh: "ระยอง 9", nameEn: "Rayong 9", subtypeTh: "นิยมปลูก", cycleDays: 300, heatFactor: 0.9, coldFactor: 1.0, noteTh: "ผลผลิตและเปอร์เซ็นต์แป้งดี ปรับตัวได้หลายพื้นที่" },
    { id: "ku50", nameTh: "เกษตรศาสตร์ 50", nameEn: "Kasetsart 50", subtypeTh: "ผลผลิตสูง", cycleDays: 330, heatFactor: 0.9, coldFactor: 1.0, noteTh: "ผลผลิตสูง แต่ค่อนข้างอ่อนแอต่อโรคใบด่าง ควรใช้ท่อนพันธุ์สะอาด" },
    { id: "rayong72", nameTh: "ระยอง 72", nameEn: "Rayong 72", subtypeTh: "อายุสั้น ทนแล้ง", cycleDays: 270, heatFactor: 0.88, coldFactor: 1.0, noteTh: "ตั้งตัวเร็ว ทนแล้งดี เหมาะดินร่วนปนทราย" },
    { id: "huaybong60", nameTh: "ห้วยบง 60", nameEn: "Huay Bong 60", subtypeTh: "แป้งสูง", cycleDays: 330, heatFactor: 0.9, coldFactor: 1.0, noteTh: "เปอร์เซ็นต์แป้งสูง เหมาะส่งโรงแป้ง" },
  ],
  stages: [
    { id: "sprouting", labelTh: "งอก/ตั้งตัว", endFraction: 0.12, sensitivity: { flood: 0.8, drought: 0.7, heat: 0.3, wind: 0.1, cold: 0.4 } },
    { id: "canopy", labelTh: "สร้างทรงพุ่ม/ใบ", endFraction: 0.35, sensitivity: { flood: 0.6, drought: 0.5, heat: 0.3, wind: 0.2, cold: 0.3 } },
    { id: "bulking", labelTh: "ลงหัว/สร้างหัว", endFraction: 0.75, sensitivity: { flood: 0.9, drought: 0.6, heat: 0.3, wind: 0.2, cold: 0.3 } },
    { id: "starch", labelTh: "สะสมแป้ง", endFraction: 1.0, sensitivity: { flood: 0.8, drought: 0.2, heat: 0.2, wind: 0.2, cold: 0.2 } },
  ],
  factorLabels: {
    flood: "ฝนหนัก/น้ำขัง (หัวเน่า)",
    drought: "ฝนทิ้งช่วง/ขาดน้ำ",
    heat: "อากาศร้อนจัด",
    wind: "ลมแรง",
    cold: "อากาศเย็นจัด",
  },
  factorAdvice: {
    flood: {
      sprouting: "น้ำขังหลังปลูกทำให้ท่อนพันธุ์เน่า ไม่งอก ควรยกร่องและระบายน้ำ",
      bulking: "น้ำขังช่วงลงหัวเสี่ยงหัวเน่าอย่างมาก ควรเร่งระบายน้ำออกจากแปลง",
      starch: "น้ำขังช่วงสะสมแป้งทำให้หัวเน่าและแป้งต่ำ ควรระบายน้ำ",
    },
    drought: {
      sprouting: "ขาดน้ำช่วงตั้งตัวทำให้งอกไม่สม่ำเสมอ ควรปลูกเมื่อดินมีความชื้นพอ",
      bulking: "ขาดน้ำช่วงลงหัวทำให้หัวเล็ก ผลผลิตลด ถ้าให้น้ำได้จะช่วยมาก",
    },
  },
  genericAdvice: {
    flood: "มีช่วงฝนตกหนัก มันสำปะหลังไม่ทนน้ำขัง ควรยกร่อง/ระบายน้ำ",
    drought: "มันสำปะหลังทนแล้งได้ดี แต่ขาดน้ำนานช่วงลงหัวจะกระทบผลผลิต",
    heat: "มันสำปะหลังทนร้อนได้ดี โดยทั่วไปความร้อนกระทบน้อย",
    wind: "มีช่วงลมแรง ต้นสูงอาจโยก ควรสำรวจการตั้งตัวของต้น",
    cold: "อากาศเย็นจัดอาจชะลอการเติบโต โดยทั่วไปในไทยกระทบน้อย",
  },
  fertilizer: {
    clay: [
      { stageId: "sprouting", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "25-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว" },
      { stageId: "canopy", timingTh: "แต่งหน้า (อายุ 30-60 วัน ช่วงรากมากสุด)", productTh: "15-15-15 หรือ 15-7-18", rateTh: "50 กก./ไร่", purposeTh: "สร้างต้น-ใบ และเริ่มลงหัว" },
      { stageId: "bulking", timingTh: "บำรุงหัว (ระเบิดหัว)", productTh: "13-13-21 หรือ 0-0-60 (โพแทส)", rateTh: "25-50 กก./ไร่", purposeTh: "เพิ่มขนาดหัวและเปอร์เซ็นต์แป้ง" },
    ],
    loam: [
      { stageId: "sprouting", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "25-50 กก./ไร่", purposeTh: "เร่งราก ตั้งตัว" },
      { stageId: "canopy", timingTh: "แต่งหน้า (อายุ 30-60 วัน)", productTh: "15-15-15 หรือ 15-7-18", rateTh: "50 กก./ไร่", purposeTh: "สร้างต้น-ใบ และเริ่มลงหัว" },
      { stageId: "bulking", timingTh: "บำรุงหัว (ระเบิดหัว)", productTh: "13-13-21", rateTh: "25-50 กก./ไร่", purposeTh: "เพิ่มขนาดหัวและแป้ง" },
    ],
    sandy: [
      { stageId: "sprouting", timingTh: "รองพื้น (ขณะปลูก)", productTh: "15-15-15", rateTh: "25-50 กก./ไร่", purposeTh: "เร่งตั้งตัวในดินทราย" },
      { stageId: "canopy", timingTh: "แต่งหน้า (แบ่งใส่ ดินทรายชะล้างเร็ว)", productTh: "15-7-18 หรือ 13-13-21", rateTh: "รวม ~50-60 กก./ไร่", purposeTh: "สร้างต้นและกันการชะล้างธาตุอาหาร" },
      { stageId: "bulking", timingTh: "บำรุงหัว (ระเบิดหัว)", productTh: "0-0-60 หรือ 13-13-21", rateTh: "30-50 กก./ไร่", purposeTh: "เพิ่มขนาดหัวและแป้ง" },
    ],
  },
  buildProtection,
  scoringNoteTh:
    "ระบบนับอายุมันสำปะหลังจากวันปลูกตามพันธุ์ (อายุ ~8-12 เดือน) แล้วจับคู่ช่วง 15 วันกับระยะ (งอก → สร้างทรงพุ่ม → ลงหัว → สะสมแป้ง) มันสำปะหลังทนแล้งดี แต่ไม่ทนน้ำขัง โดยเฉพาะช่วงลงหัวที่น้ำท่วมขังทำให้หัวเน่าเสียหายมาก",
};
