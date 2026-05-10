import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Happysent – Födelsedagstårtor till företag, automatiskt",
    template: "%s | Happysent",
  },
  description:
    "Glöm aldrig en kollegas födelsedag igen. Happysent bokar och levererar tårtor från lokala bagerier till ditt kontor – helt automatiskt.",
  metadataBase: new URL("https://happysent.se"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
