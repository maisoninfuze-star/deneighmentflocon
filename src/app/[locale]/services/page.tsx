import { setRequestLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Process } from "@/components/sections/Process";
import { CtaBand } from "@/components/sections/CtaBand";
import { TrustBar } from "@/components/sections/TrustBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "services", href: "/services" });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("servicesPage");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("lead")}
      />
      <ServicesGrid />
      <Process />
      <TrustBar />
      <CtaBand />
    </>
  );
}
