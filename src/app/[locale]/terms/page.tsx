import { setRequestLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/layout/LegalPage";
import { getTerms } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "terms", href: "/terms" });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tn = await getTranslations("nav");

  return (
    <LegalPage
      eyebrow={tn("terms")}
      title={locale === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
      doc={getTerms(locale)}
    />
  );
}
