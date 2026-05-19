import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Kalam } from "next/font/google";

import "@fontsource-variable/host-grotesk/wght.css";

import "./globals.css";

import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const site = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Happysent | Automatiska födelsedagstårtor till företag i Malmö",
  description:
    "Glöm aldrig en kollegas födelsedag igen. Happysent bokar och levererar tårtor från lokala bagerier till ert kontor i Malmö, automatiskt.",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: site,
    siteName: "Happysent",
    title:
      "Happysent | Automatiska födelsedagstårtor till företag i Malmö",
    description:
      "Automatiska födelsedagstårtor för företag. Lokala bagerier, leverans på jobbet, en faktura i månaden.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Happysent | Födelsedagstårtor till företag",
    description:
      "Automatiska födelsedagstårtor för företag i Malmö. Vi sköter påminnelser och leveranser.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeHeader = headers().get("x-happysent-locale");
  const lang = localeHeader === "en" ? "en" : "sv";

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${kalam.variable}`}
    >
      <body className="min-h-screen bg-cream font-sans antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
