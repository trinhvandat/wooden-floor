import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
