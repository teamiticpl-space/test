import type { Province, ThaiRegion } from "@/lib/types";

// All 77 Thai provinces with approximate province-capital coordinates.
// Coordinates are centroids of the capital district (เมือง) — accurate enough
// for province-level weather lookups via Open-Meteo.
export const PROVINCES: Province[] = [
  // ภาคเหนือ (9)
  { id: "chiang-mai", nameTh: "เชียงใหม่", nameEn: "Chiang Mai", region: "เหนือ", lat: 18.79, lon: 98.98 },
  { id: "chiang-rai", nameTh: "เชียงราย", nameEn: "Chiang Rai", region: "เหนือ", lat: 19.91, lon: 99.83 },
  { id: "lampang", nameTh: "ลำปาง", nameEn: "Lampang", region: "เหนือ", lat: 18.29, lon: 99.49 },
  { id: "lamphun", nameTh: "ลำพูน", nameEn: "Lamphun", region: "เหนือ", lat: 18.58, lon: 99.01 },
  { id: "mae-hong-son", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son", region: "เหนือ", lat: 19.3, lon: 97.97 },
  { id: "nan", nameTh: "น่าน", nameEn: "Nan", region: "เหนือ", lat: 18.78, lon: 100.77 },
  { id: "phayao", nameTh: "พะเยา", nameEn: "Phayao", region: "เหนือ", lat: 19.17, lon: 99.9 },
  { id: "phrae", nameTh: "แพร่", nameEn: "Phrae", region: "เหนือ", lat: 18.14, lon: 100.14 },
  { id: "uttaradit", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit", region: "เหนือ", lat: 17.62, lon: 100.1 },

  // ภาคตะวันออกเฉียงเหนือ (20)
  { id: "kalasin", nameTh: "กาฬสินธุ์", nameEn: "Kalasin", region: "ตะวันออกเฉียงเหนือ", lat: 16.43, lon: 103.51 },
  { id: "khon-kaen", nameTh: "ขอนแก่น", nameEn: "Khon Kaen", region: "ตะวันออกเฉียงเหนือ", lat: 16.44, lon: 102.84 },
  { id: "chaiyaphum", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum", region: "ตะวันออกเฉียงเหนือ", lat: 15.81, lon: 102.03 },
  { id: "nakhon-phanom", nameTh: "นครพนม", nameEn: "Nakhon Phanom", region: "ตะวันออกเฉียงเหนือ", lat: 17.39, lon: 104.77 },
  { id: "nakhon-ratchasima", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima", region: "ตะวันออกเฉียงเหนือ", lat: 14.98, lon: 102.1 },
  { id: "bueng-kan", nameTh: "บึงกาฬ", nameEn: "Bueng Kan", region: "ตะวันออกเฉียงเหนือ", lat: 18.36, lon: 103.65 },
  { id: "buriram", nameTh: "บุรีรัมย์", nameEn: "Buriram", region: "ตะวันออกเฉียงเหนือ", lat: 14.99, lon: 103.1 },
  { id: "maha-sarakham", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham", region: "ตะวันออกเฉียงเหนือ", lat: 16.18, lon: 103.3 },
  { id: "mukdahan", nameTh: "มุกดาหาร", nameEn: "Mukdahan", region: "ตะวันออกเฉียงเหนือ", lat: 16.54, lon: 104.72 },
  { id: "yasothon", nameTh: "ยโสธร", nameEn: "Yasothon", region: "ตะวันออกเฉียงเหนือ", lat: 15.79, lon: 104.15 },
  { id: "roi-et", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et", region: "ตะวันออกเฉียงเหนือ", lat: 16.05, lon: 103.65 },
  { id: "loei", nameTh: "เลย", nameEn: "Loei", region: "ตะวันออกเฉียงเหนือ", lat: 17.49, lon: 101.73 },
  { id: "si-sa-ket", nameTh: "ศรีสะเกษ", nameEn: "Si Sa Ket", region: "ตะวันออกเฉียงเหนือ", lat: 15.12, lon: 104.32 },
  { id: "sakon-nakhon", nameTh: "สกลนคร", nameEn: "Sakon Nakhon", region: "ตะวันออกเฉียงเหนือ", lat: 17.16, lon: 104.15 },
  { id: "surin", nameTh: "สุรินทร์", nameEn: "Surin", region: "ตะวันออกเฉียงเหนือ", lat: 14.88, lon: 103.49 },
  { id: "nong-khai", nameTh: "หนองคาย", nameEn: "Nong Khai", region: "ตะวันออกเฉียงเหนือ", lat: 17.88, lon: 102.74 },
  { id: "nong-bua-lamphu", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lamphu", region: "ตะวันออกเฉียงเหนือ", lat: 17.2, lon: 102.43 },
  { id: "amnat-charoen", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen", region: "ตะวันออกเฉียงเหนือ", lat: 15.86, lon: 104.63 },
  { id: "udon-thani", nameTh: "อุดรธานี", nameEn: "Udon Thani", region: "ตะวันออกเฉียงเหนือ", lat: 17.41, lon: 102.79 },
  { id: "ubon-ratchathani", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani", region: "ตะวันออกเฉียงเหนือ", lat: 15.24, lon: 104.85 },

  // ภาคกลาง (22)
  { id: "bangkok", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok", region: "กลาง", lat: 13.75, lon: 100.5 },
  { id: "kamphaeng-phet", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet", region: "กลาง", lat: 16.48, lon: 99.52 },
  { id: "chai-nat", nameTh: "ชัยนาท", nameEn: "Chai Nat", region: "กลาง", lat: 15.19, lon: 100.13 },
  { id: "nakhon-nayok", nameTh: "นครนายก", nameEn: "Nakhon Nayok", region: "กลาง", lat: 14.2, lon: 101.21 },
  { id: "nakhon-pathom", nameTh: "นครปฐม", nameEn: "Nakhon Pathom", region: "กลาง", lat: 13.82, lon: 100.06 },
  { id: "nakhon-sawan", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan", region: "กลาง", lat: 15.7, lon: 100.14 },
  { id: "nonthaburi", nameTh: "นนทบุรี", nameEn: "Nonthaburi", region: "กลาง", lat: 13.86, lon: 100.51 },
  { id: "pathum-thani", nameTh: "ปทุมธานี", nameEn: "Pathum Thani", region: "กลาง", lat: 14.02, lon: 100.53 },
  { id: "ayutthaya", nameTh: "พระนครศรีอยุธยา", nameEn: "Phra Nakhon Si Ayutthaya", region: "กลาง", lat: 14.35, lon: 100.57 },
  { id: "phichit", nameTh: "พิจิตร", nameEn: "Phichit", region: "กลาง", lat: 16.44, lon: 100.35 },
  { id: "phitsanulok", nameTh: "พิษณุโลก", nameEn: "Phitsanulok", region: "กลาง", lat: 16.82, lon: 100.27 },
  { id: "phetchabun", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun", region: "กลาง", lat: 16.42, lon: 101.16 },
  { id: "lopburi", nameTh: "ลพบุรี", nameEn: "Lopburi", region: "กลาง", lat: 14.8, lon: 100.65 },
  { id: "samut-prakan", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan", region: "กลาง", lat: 13.6, lon: 100.6 },
  { id: "samut-songkhram", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram", region: "กลาง", lat: 13.41, lon: 100.0 },
  { id: "samut-sakhon", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon", region: "กลาง", lat: 13.55, lon: 100.27 },
  { id: "sing-buri", nameTh: "สิงห์บุรี", nameEn: "Sing Buri", region: "กลาง", lat: 14.89, lon: 100.4 },
  { id: "sukhothai", nameTh: "สุโขทัย", nameEn: "Sukhothai", region: "กลาง", lat: 17.01, lon: 99.82 },
  { id: "suphan-buri", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri", region: "กลาง", lat: 14.47, lon: 100.12 },
  { id: "saraburi", nameTh: "สระบุรี", nameEn: "Saraburi", region: "กลาง", lat: 14.53, lon: 100.91 },
  { id: "ang-thong", nameTh: "อ่างทอง", nameEn: "Ang Thong", region: "กลาง", lat: 14.59, lon: 100.45 },
  { id: "uthai-thani", nameTh: "อุทัยธานี", nameEn: "Uthai Thani", region: "กลาง", lat: 15.38, lon: 100.02 },

  // ภาคตะวันออก (7)
  { id: "chanthaburi", nameTh: "จันทบุรี", nameEn: "Chanthaburi", region: "ตะวันออก", lat: 12.61, lon: 102.1 },
  { id: "chachoengsao", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao", region: "ตะวันออก", lat: 13.69, lon: 101.07 },
  { id: "chonburi", nameTh: "ชลบุรี", nameEn: "Chon Buri", region: "ตะวันออก", lat: 13.36, lon: 100.98 },
  { id: "trat", nameTh: "ตราด", nameEn: "Trat", region: "ตะวันออก", lat: 12.24, lon: 102.51 },
  { id: "prachin-buri", nameTh: "ปราจีนบุรี", nameEn: "Prachin Buri", region: "ตะวันออก", lat: 14.05, lon: 101.37 },
  { id: "rayong", nameTh: "ระยอง", nameEn: "Rayong", region: "ตะวันออก", lat: 12.68, lon: 101.28 },
  { id: "sa-kaeo", nameTh: "สระแก้ว", nameEn: "Sa Kaeo", region: "ตะวันออก", lat: 13.82, lon: 102.07 },

  // ภาคตะวันตก (5)
  { id: "kanchanaburi", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi", region: "ตะวันตก", lat: 14.02, lon: 99.53 },
  { id: "tak", nameTh: "ตาก", nameEn: "Tak", region: "ตะวันตก", lat: 16.88, lon: 99.13 },
  { id: "prachuap-khiri-khan", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan", region: "ตะวันตก", lat: 11.81, lon: 99.8 },
  { id: "phetchaburi", nameTh: "เพชรบุรี", nameEn: "Phetchaburi", region: "ตะวันตก", lat: 13.11, lon: 99.94 },
  { id: "ratchaburi", nameTh: "ราชบุรี", nameEn: "Ratchaburi", region: "ตะวันตก", lat: 13.54, lon: 99.82 },

  // ภาคใต้ (14)
  { id: "krabi", nameTh: "กระบี่", nameEn: "Krabi", region: "ใต้", lat: 8.06, lon: 98.92 },
  { id: "chumphon", nameTh: "ชุมพร", nameEn: "Chumphon", region: "ใต้", lat: 10.49, lon: 99.18 },
  { id: "trang", nameTh: "ตรัง", nameEn: "Trang", region: "ใต้", lat: 7.56, lon: 99.61 },
  { id: "nakhon-si-thammarat", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat", region: "ใต้", lat: 8.43, lon: 99.96 },
  { id: "narathiwat", nameTh: "นราธิวาส", nameEn: "Narathiwat", region: "ใต้", lat: 6.43, lon: 101.82 },
  { id: "pattani", nameTh: "ปัตตานี", nameEn: "Pattani", region: "ใต้", lat: 6.87, lon: 101.25 },
  { id: "phang-nga", nameTh: "พังงา", nameEn: "Phang Nga", region: "ใต้", lat: 8.45, lon: 98.53 },
  { id: "phatthalung", nameTh: "พัทลุง", nameEn: "Phatthalung", region: "ใต้", lat: 7.62, lon: 100.07 },
  { id: "phuket", nameTh: "ภูเก็ต", nameEn: "Phuket", region: "ใต้", lat: 7.88, lon: 98.39 },
  { id: "yala", nameTh: "ยะลา", nameEn: "Yala", region: "ใต้", lat: 6.54, lon: 101.28 },
  { id: "ranong", nameTh: "ระนอง", nameEn: "Ranong", region: "ใต้", lat: 9.96, lon: 98.64 },
  { id: "songkhla", nameTh: "สงขลา", nameEn: "Songkhla", region: "ใต้", lat: 7.19, lon: 100.6 },
  { id: "satun", nameTh: "สตูล", nameEn: "Satun", region: "ใต้", lat: 6.62, lon: 100.07 },
  { id: "surat-thani", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani", region: "ใต้", lat: 9.14, lon: 99.33 },
];

export const REGIONS: ThaiRegion[] = [
  "เหนือ",
  "ตะวันออกเฉียงเหนือ",
  "กลาง",
  "ตะวันออก",
  "ตะวันตก",
  "ใต้",
];

const provinceMap = new Map(PROVINCES.map((p) => [p.id, p]));

export function getProvince(id: string): Province | undefined {
  return provinceMap.get(id);
}

export const DEFAULT_PROVINCE_ID = "bangkok";
