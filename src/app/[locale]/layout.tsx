import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Manrope } from "next/font/google";

import { routing } from "@/i18n/routing";
import { site, type Locale } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Intro } from "@/components/Intro";
import { SmoothScroll } from "@/components/SmoothScroll";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("title"),
      template: `%s`,
    },
    description: t("description"),
    applicationName: site.name,
    authors: [{ name: site.name }],
    generator: undefined,
    alternates: {
      canonical: locale === "fr" ? "/" : "/en",
      languages: { "fr-CA": "/", "en-CA": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: locale === "fr" ? "en_CA" : "fr_CA",
      title: t("title"),
      description: t("description"),
      url: locale === "fr" ? site.url : `${site.url}/en`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport = {
  themeColor: "#01121F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opt this route tree into static rendering.
  setRequestLocale(locale);

  const settings = await getSettings();
  const announcement = settings.announcement.enabled
    ? locale === "fr"
      ? settings.announcement.fr
      : settings.announcement.en
    : "";

  return (
    <html
      lang={locale === "fr" ? "fr-CA" : "en-CA"}
      className={`${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-navy-950">
        <NextIntlClientProvider>
          <Intro />
          <SmoothScroll />
          <Header phone={settings.phone} announcement={announcement} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <LocalBusinessSchema locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
