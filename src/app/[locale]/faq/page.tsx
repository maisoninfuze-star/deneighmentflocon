import { setRequestLocale, getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";

import { site, type Locale } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "faq", href: "/faq" });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");
  const items = t.raw("items") as QA[];

  // FAQPage structured data — these questions are exactly the long-tail
  // queries people type before hiring a snow removal company.
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("subtitle")}
      />

      <section className="section-tight relative overflow-hidden bg-navy-950 pb-32">
        <div className="shell relative max-w-4xl">
          <Reveal>
            <Accordion items={items} defaultOpen={0} />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-16 rounded-2xl border border-gold-500/18 bg-gold-500/5 p-9 text-center">
              <p className="font-display text-display-sm text-snow">
                {t("stillQuestions")}
              </p>
              <ButtonLink
                href={toTelHref(site.phoneRaw)}
                variant="primary"
                size="lg"
                className="mt-8"
              >
                <Phone className="size-4" />
                {site.phone}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
