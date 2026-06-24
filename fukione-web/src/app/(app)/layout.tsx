import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

// Body / UI — clean, reliable Vietnamese diacritics
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Display — warm, high-character serif for editorial headlines
const display = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FUKIONE — Sàn gỗ cao cấp tại Hà Nội",
    template: "%s — FUKIONE",
  },
  description:
    "Sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội. Tư vấn miễn phí, báo giá nhanh, khảo sát tận nơi.",
  openGraph: BASE_OPEN_GRAPH,
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        {/* pb-24 reserves space so the mobile bottom action bar never covers content */}
        <main className="flex flex-1 flex-col pb-24 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
