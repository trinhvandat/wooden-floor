import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "FUKIONE",
  description: "FUKIONE - Sàn gỗ cao cấp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${font.className} min-h-full flex flex-col`}>
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
