import type { CropModel, ProtectionAlert, ProtectionContext } from "@/lib/risk/crops/types";

// ข้าว (rice) — นาน้ำฝน. Stage model, varieties, fertilizer, and crop
// protection ported from the dedicated rice engine (กรมการข้าว / DOAE basis).

function buildProtection({ stats, stages, variety }: ProtectionContext): ProtectionAlert[] {
  const alerts: ProtectionAlert[] = [];
  // กข6 is documented blast-susceptible; กข57 ต้านทานโรคไหม้ค่อนข้างดี.
  const susceptibleBlast = variety.id === "rd6";
  const resistantBlast = variety.id === "rd57";
  const susceptibleBph = variety.id === "pathum1";

  const wetPressure = stats.humidityMean >= 80 || stats.rainyDays >= 4;
  // Booting + flowering are the neck/panicle-blast window (ไหม้คอรวง).
  const neckBlastStage = stages.has("booting") || stages.has("flowering");

  if (wetPressure && (stages.has("germination") || stages.has("tillering") || neckBlastStage)) {
    // Peak window is high risk; a resistant variety eases it to moderate.
    let severity: ProtectionAlert["severity"] = neckBlastStage
      ? resistantBlast
        ? "moderate"
        : "high"
      : "moderate";
    if (!neckBlastStage && susceptibleBlast) severity = "high";
    alerts.push({
      id: "blast",
      threatTh: neckBlastStage ? "โรคไหม้คอรวง (ระยะตั้งท้อง-ออกดอก)" : "โรคไหม้ (ใบไหม้)",
      causeTh: `ความชื้นสูง (เฉลี่ย ${Math.round(stats.humidityMean)}%) และฝนพรำต่อเนื่อง เอื้อต่อเชื้อรา`,
      severity,
      actionTh:
        "สำรวจแปลงช่วงเช้า งดใส่ปุ๋ยไนโตรเจนมากเกิน ระบายน้ำไม่ให้ชื้นแฉะ ใช้พันธุ์ต้านทาน/เชื้อราไตรโคเดอร์มา หากพบจุดไหม้ลามให้ปรึกษาเกษตรอำเภอเรื่องสารป้องกันเชื้อราตามฉลาก",
    });
  }

  if (stats.rainTotal >= 60 && stats.maxWind >= 45 && (stages.has("tillering") || neckBlastStage)) {
    alerts.push({
      id: "blb",
      threatTh: "โรคขอบใบแห้ง (เชื้อแบคทีเรีย)",
      causeTh: `ฝนสะสมมาก (~${Math.round(stats.rainTotal)} มม.) ร่วมกับลมแรง ทำให้ใบเป็นแผลและเชื้อแพร่ทางน้ำ/ลม`,
      severity: "moderate",
      actionTh:
        "ระบายน้ำที่ท่วมขัง หลีกเลี่ยงการใส่ปุ๋ยไนโตรเจนสูงช่วงนี้ ใช้พันธุ์ต้านทาน และหลีกเลี่ยงการเดินลุยแปลงตอนใบเปียกเพื่อลดการแพร่เชื้อ",
    });
  }

  if (stats.humidityMean >= 80 && stats.maxTemp >= 32 && (stages.has("tillering") || stages.has("booting"))) {
    alerts.push({
      id: "bph",
      threatTh: "เพลี้ยกระโดดสีน้ำตาล",
      causeTh: `อากาศอุ่นชื้น (สูงสุด ${Math.round(stats.maxTemp)}°C, ความชื้น ${Math.round(stats.humidityMean)}%) เร่งการเพิ่มจำนวนเพลี้ย`,
      severity: susceptibleBph ? "high" : "moderate",
      actionTh:
        "สำรวจโคนกอทุก 3-5 วัน ใช้กับดักแสง/ระดับเศรษฐกิจก่อนพ่นสาร อนุรักษ์ศัตรูธรรมชาติ (มวนเขียวดูดไข่) เลี่ยงใส่ปุ๋ยไนโตรเจนมากและการปลูกหนาแน่น",
    });
  }

  if (stats.rainTotal < 15 && stats.maxTemp >= 32 && (stages.has("germination") || stages.has("tillering"))) {
    alerts.push({
      id: "thrips",
      threatTh: "เพลี้ยไฟ (ระยะกล้า)",
      causeTh: `ฝนน้อย (~${Math.round(stats.rainTotal)} มม.) และอากาศร้อนแล้ง เอื้อต่อเพลี้ยไฟ`,
      severity: "moderate",
      actionTh:
        "รักษาระดับน้ำในแปลงไม่ให้แห้ง สำรวจปลายใบที่ม้วนเหลือง หากระบาดรุนแรงค่อยใช้สารตามคำแนะนำเกษตรอำเภอ",
    });
  }

  return alerts;
}

export const RICE: CropModel = {
  id: "rice",
  nameTh: "ข้าว",
  nameEn: "Rice",
  iconKey: "wheat",
  accent: "#0ea5e9",
  plantVerbTh: "หว่าน",
  plantingLabelTh: "วันที่หว่านข้าว",
  defaultVarietyId: "rd41",
  varieties: [
    { id: "rd43", nameTh: "กข43", nameEn: "RD43", subtypeTh: "ข้าวเจ้า", cycleDays: 95, heatFactor: 1.05, coldFactor: 1.0, noteTh: "พันธุ์เบา อายุสั้น น้ำตาลต่ำ เหมาะปลูกหนีน้ำหรือช่วงน้ำจำกัด" },
    { id: "rd41", nameTh: "กข41", nameEn: "RD41", subtypeTh: "ข้าวเจ้า", cycleDays: 105, heatFactor: 1.0, coldFactor: 1.0, noteTh: "ไม่ไวต่อช่วงแสง ปลูกได้ทั้งนาปีและนาปรัง ผลผลิตสูง" },
    { id: "rd57", nameTh: "กข57", nameEn: "RD57", subtypeTh: "ข้าวเจ้า", cycleDays: 120, heatFactor: 1.0, coldFactor: 0.95, noteTh: "ไม่ไวต่อช่วงแสง ต้านทานโรคไหม้ค่อนข้างดี" },
    { id: "pathum1", nameTh: "ปทุมธานี1", nameEn: "Pathum Thani 1", subtypeTh: "ข้าวเจ้าหอม", cycleDays: 120, heatFactor: 1.0, coldFactor: 0.95, noteTh: "ข้าวหอม ไม่ไวต่อช่วงแสง แต่ค่อนข้างอ่อนแอต่อเพลี้ยกระโดดสีน้ำตาล" },
    { id: "kdml105", nameTh: "ขาวดอกมะลิ 105", nameEn: "KDML105", subtypeTh: "ข้าวหอมมะลิ", cycleDays: 120, photoperiodSensitive: true, heatFactor: 1.1, coldFactor: 1.0, noteTh: "ข้าวหอมมะลิ นาปี ไวต่อช่วงแสง ออกดอกตามวันสั้น เก็บเกี่ยวราว พ.ย." },
    { id: "rd6", nameTh: "กข6", nameEn: "RD6", subtypeTh: "ข้าวเหนียว", cycleDays: 145, photoperiodSensitive: true, heatFactor: 1.0, coldFactor: 1.05, noteTh: "ข้าวเหนียว นาปี ไวต่อช่วงแสง ค่อนข้างอ่อนแอต่อโรคไหม้" },
  ],
  stages: [
    { id: "germination", labelTh: "งอก/ต้นกล้า", endFraction: 0.12, sensitivity: { flood: 0.9, drought: 0.9, heat: 0.3, wind: 0.2, cold: 0.4 } },
    { id: "tillering", labelTh: "แตกกอ", endFraction: 0.36, sensitivity: { flood: 0.5, drought: 0.8, heat: 0.4, wind: 0.3, cold: 0.3 } },
    { id: "booting", labelTh: "ตั้งท้อง", endFraction: 0.52, sensitivity: { flood: 0.6, drought: 1.0, heat: 0.7, wind: 0.4, cold: 0.8 } },
    { id: "flowering", labelTh: "ออกดอก", endFraction: 0.64, sensitivity: { flood: 0.9, drought: 0.9, heat: 1.0, wind: 0.7, cold: 0.9 } },
    { id: "grainFilling", labelTh: "เติมเมล็ด", endFraction: 0.84, sensitivity: { flood: 0.6, drought: 0.6, heat: 0.8, wind: 0.6, cold: 0.3 } },
    { id: "maturity", labelTh: "สุกแก่/เก็บเกี่ยว", endFraction: 1.0, sensitivity: { flood: 1.0, drought: 0.0, heat: 0.2, wind: 0.9, cold: 0.1 } },
  ],
  factorLabels: {
    flood: "ฝนหนัก/น้ำท่วม",
    drought: "ฝนทิ้งช่วง/ขาดน้ำ",
    heat: "อากาศร้อนจัด",
    wind: "ลมแรง",
    cold: "อากาศเย็นจัด",
  },
  factorAdvice: {
    flood: {
      germination: "ฝนหนักหลังหว่าน เมล็ดเสี่ยงถูกชะล้างหรือเน่าจากน้ำขัง ควรเลื่อนวันหว่านหรือเตรียมทางระบายน้ำ",
      flowering: "ฝนหนักช่วงข้าวออกดอกจะชะล้างละอองเกสร ทำให้ติดเมล็ดน้อย ควรเฝ้าระวังและระบายน้ำส่วนเกิน",
      maturity: "ฝนตกช่วงเก็บเกี่ยว เสี่ยงข้าวเปียก เมล็ดงอกคารวง ควรวางแผนเกี่ยวก่อนฝนหรือเตรียมที่ตากข้าว",
    },
    drought: {
      germination: "ฝนน้อยช่วงหลังหว่าน เมล็ดอาจงอกไม่สม่ำเสมอ ควรรอหว่านช่วงที่มีฝน หรือเตรียมน้ำเสริม",
      booting: "ข้าวตั้งท้องเจอฝนทิ้งช่วงจะกระทบการสร้างรวงมาก ควรรักษาระดับน้ำในแปลงเป็นพิเศษ",
      flowering: "ขาดน้ำช่วงออกดอกทำให้เมล็ดลีบ ควรสูบน้ำเข้าแปลงรักษาระดับน้ำให้สม่ำเสมอ",
    },
    heat: {
      flowering: "อากาศร้อนจัด (≥35°C) ช่วงข้าวออกดอก เสี่ยงเมล็ดลีบจากเกสรเป็นหมัน การขังน้ำในแปลงช่วยลดอุณหภูมิได้",
      grainFilling: "อากาศร้อนช่วงเติมเมล็ดทำให้เมล็ดน้ำหนักเบา ควรรักษาน้ำในแปลงไม่ให้ขาด",
    },
    wind: {
      flowering: "ลมแรงช่วงออกดอกกระทบการผสมเกสร ควรติดตามพยากรณ์ใกล้ชิด",
      maturity: "ลมแรงช่วงข้าวใกล้เกี่ยว เสี่ยงข้าวล้ม (หักล้ม) ควรเร่งเก็บเกี่ยวเมื่อข้าวแก่พอ",
    },
    cold: {
      booting: "อากาศเย็นจัดช่วงตั้งท้องทำให้รวงเป็นหมันได้ ควรขังน้ำในแปลงให้ลึกขึ้นเพื่อรักษาอุณหภูมิ",
      flowering: "อากาศเย็นจัดช่วงออกดอกกระทบการติดเมล็ด ควรขังน้ำรักษาอุณหภูมิแปลง",
    },
  },
  genericAdvice: {
    flood: "มีช่วงฝนตกหนัก ควรตรวจทางระบายน้ำของแปลงล่วงหน้า",
    drought: "มีช่วงฝนน้อยต่อเนื่อง ควรวางแผนสำรองน้ำให้เพียงพอ",
    heat: "มีช่วงอากาศร้อนจัด ควรรักษาระดับน้ำในแปลงเพื่อช่วยลดอุณหภูมิ",
    wind: "มีช่วงลมแรง ควรติดตามประกาศเตือนภัยอย่างใกล้ชิด",
    cold: "มีช่วงอากาศเย็นจัด ควรขังน้ำในแปลงเพื่อรักษาอุณหภูมิ",
  },
  fertilizer: {
    clay: [
      { stageId: "germination", timingTh: "รองพื้น (ก่อน/ขณะหว่าน)", productTh: "18-46-0 หรือ 16-20-0", rateTh: "20-25 กก./ไร่", purposeTh: "เร่งราก ตั้งตัวเร็ว" },
      { stageId: "tillering", timingTh: "แต่งหน้าครั้งที่ 1 (ระยะแตกกอ ~20 วัน)", productTh: "16-20-0 (15-20 กก.) + ยูเรีย 46-0-0 (8-10 กก.)", rateTh: "รวม ~25-30 กก./ไร่", purposeTh: "ส่งเสริมการแตกกอ เพิ่มจำนวนต้น" },
      { stageId: "booting", timingTh: "แต่งหน้าครั้งที่ 2 (กำเนิดช่อดอก/ตั้งท้อง)", productTh: "ยูเรีย 46-0-0", rateTh: "5-10 กก./ไร่", purposeTh: "เพิ่มจำนวนเมล็ดและน้ำหนักรวง" },
    ],
    loam: [
      { stageId: "germination", timingTh: "รองพื้น (ก่อน/ขณะหว่าน)", productTh: "16-20-0", rateTh: "20-25 กก./ไร่", purposeTh: "เร่งราก ตั้งตัวเร็ว" },
      { stageId: "tillering", timingTh: "แต่งหน้าครั้งที่ 1 (ระยะแตกกอ ~20 วัน)", productTh: "16-16-8 + ยูเรีย 46-0-0 (5-10 กก.)", rateTh: "รวม ~25-30 กก./ไร่", purposeTh: "ส่งเสริมการแตกกอ เพิ่มจำนวนต้น" },
      { stageId: "booting", timingTh: "แต่งหน้าครั้งที่ 2 (กำเนิดช่อดอก/ตั้งท้อง)", productTh: "16-16-8 (เสริมโพแทส) หรือ ยูเรีย 46-0-0", rateTh: "10-15 กก./ไร่", purposeTh: "เพิ่มน้ำหนักเมล็ด (เลือก 16-16-8 หากดินมีโพแทสต่ำ)" },
    ],
    sandy: [
      { stageId: "germination", timingTh: "รองพื้น (ก่อน/ขณะหว่าน)", productTh: "16-16-8", rateTh: "20-25 กก./ไร่", purposeTh: "เสริมโพแทสเซียมที่ดินทรายมักขาด" },
      { stageId: "tillering", timingTh: "แต่งหน้าครั้งที่ 1 (ระยะแตกกอ ~20-25 วัน)", productTh: "16-16-8 หรือ 16-8-8 (20 กก.) + ยูเรีย 46-0-0 (5-10 กก.)", rateTh: "รวม ~25-30 กก./ไร่", purposeTh: "ส่งเสริมการแตกกอ" },
      { stageId: "booting", timingTh: "แต่งหน้าครั้งที่ 2 (กำเนิดช่อดอก/ตั้งท้อง)", productTh: "16-16-8 หรือ 16-8-8", rateTh: "20-30 กก./ไร่", purposeTh: "เติมโพแทสเซียม เพิ่มน้ำหนักเมล็ด" },
    ],
  },
  fertilizerCaution: (stats) =>
    stats.rainTotal >= 60 || stats.humidityMean >= 80
      ? "ช่วงนี้ฝนชุก/ความชื้นสูง ควรใส่ปุ๋ยไนโตรเจน (ยูเรีย) ที่อัตราต่ำของช่วง เพื่อลดความเสี่ยงโรคไหม้ เพลี้ยกระโดด และข้าวล้ม"
      : null,
  buildProtection,
  scoringNoteTh:
    "ระบบนับอายุข้าวจากวันหว่านตามพันธุ์ (อายุ ~95-145 วัน) แล้วจับคู่ช่วง 15 วันที่พยากรณ์กับระยะ (งอก → แตกกอ → ตั้งท้อง → ออกดอก → เติมเมล็ด → เก็บเกี่ยว) แต่ละระยะอ่อนไหวต่อ ฝนหนัก ฝนทิ้งช่วง ร้อน ลม เย็น ไม่เท่ากัน เช่น ร้อน/เย็นช่วงออกดอกทำให้เมล็ดลีบ ฝน/ลมช่วงเก็บเกี่ยวทำให้ข้าวล้ม-งอกคารวง",
};
