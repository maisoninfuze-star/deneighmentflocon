import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, ShieldCheck, Receipt, Repeat } from "lucide-react";

import type { Locale } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { GlassCard } from "@/components/ui/GlassCard";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const VALUE_ICONS = [Clock, ShieldCheck, Receipt, Repeat];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "about", href: "/about" });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");
  const tt = await getTranslations("trust");
  const { stats } = await getSettings();
  const values = t.raw("values") as { title: string; body: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("lead")}
      />

      {/* Story */}
      <section className="section relative overflow-hidden bg-navy-950">
        <div className="shell relative grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="text-lead text-ice-300/72">{t("body1")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lead text-ice-300/72">{t("body2")}</p>
          </Reveal>
        </div>

        {/* Numbers */}
        <div className="shell relative mt-24">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-ice-300/8 pt-16 lg:grid-cols-4">
            <Reveal>
              <p className="font-display text-display-md text-gradient-gold">
                <Counter to={1200} suffix="+" />
              </p>
              <p className="mt-3 text-sm text-ice-300/55">{tt("properties")}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="font-display text-display-md text-gradient-gold">24/7</p>
              <p className="mt-3 text-sm text-ice-300/55">{tt("availability")}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="font-display text-display-md text-gradient-gold">
                &lt;<Counter to={3} suffix="h" />
              </p>
              <p className="mt-3 text-sm text-ice-300/55">{tt("response")}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="font-display text-display-md text-gradient-gold">
                <Counter to={stats.years} suffix="+" />
              </p>
              <p className="mt-3 text-sm text-ice-300/55">{tt("years")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="section relative overflow-hidden bg-navy-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-30" />
        <div className="shell relative">
          <SectionHeading title={t("valuesTitle")} />

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <Reveal key={v.title} delay={(i % 2) * 0.08}>
                  <GlassCard className="h-full p-9 md:p-11">
                    <Icon
                      className="size-6 text-gold-500"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="mt-7 font-display text-display-sm text-snow">
                      {v.title}
                    </h3>
                    <p className="mt-4 text-[1.0625rem] leading-relaxed text-ice-300/62">
                      {v.body}
                    </p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="section relative overflow-hidden bg-navy-950">
        <div className="shell relative">
          <Reveal>
            <GlassCard className="p-10 md:p-16" tilt={false}>
              <div className="max-w-2xl">
                <h2 className="text-display-md text-snow">
                  {t("equipmentTitle")}
                </h2>
                <p className="mt-7 text-lead text-ice-300/65">
                  {t("equipmentBody")}
                </p>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
