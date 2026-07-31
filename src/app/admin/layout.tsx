import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Admin — Déneigement Flocons",
  // Never index the admin area, and don't follow anything from it.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin area sits outside `[locale]` — it is single-language (French, the
 * owner's language), never indexed, and shares none of the marketing chrome.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr-CA" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-navy-950 antialiased">{children}</body>
    </html>
  );
}
