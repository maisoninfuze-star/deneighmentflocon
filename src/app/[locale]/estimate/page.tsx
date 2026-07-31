import { setRequestLocale, getTranslations } from "next-intl/server";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { EstimateForm } from "@/components/estimate/EstimateForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "estimate", href: "/estimate" });
}

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("estimate");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("subtitle")}
      />

      <section className="relative overflow-hidden bg-navy-950 pb-32">
        <div className="shell relative max-w-4xl">
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
