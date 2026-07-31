import { setRequestLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/layout/LegalPage";
import { getPrivacy } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "privacy", href: "/privacy" });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tn = await getTranslations("nav");

  return (
    <LegalPage
      eyebrow={tn("privacy")}
      title={locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
      doc={getPrivacy(locale)}
    />
  );
}
