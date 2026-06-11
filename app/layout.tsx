import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "จำลองพยากรณ์อากาศประเทศไทย | Weather Forecast Simulator",
  description:
    "พยากรณ์อากาศ 15 วันทุกจังหวัดทั่วไทย พร้อมจำลองสถานการณ์ฝน อุณหภูมิ ลม และประเมินคะแนนความเสี่ยง 0-100",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
