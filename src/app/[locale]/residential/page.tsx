import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Car,
  Footprints,
  MoveVertical,
  DoorOpen,
  Flag,
  Snowflake as SnowflakeIcon,
  ArrowRight,
} from "lucide-react";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = [Car, Footprints, MoveVertical, DoorOpen, Flag, SnowflakeIcon];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "residential", href: "/residential" });
}

export default async function ResidentialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("residential");
  const tc = await getTranslations("cta");
  const included = t.raw("included") as { title: string; body: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("lead")}
      >
        <ButtonLink href="/estimate" variant="primary" size="lg">
          {tc("estimate")}
          <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
        </ButtonLink>
      </PageHero>

      {/* What's included */}
      <section className="section relative overflow-hidden bg-navy-950">
        <div className="shell relative">
          <SectionHeading title={t("includedTitle")} />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Reveal key={item.title} delay={(i % 3) * 0.08}>
                  <GlassCard className="h-full p-8">
                    <span className="flex size-12 items-center justify-center rounded-xl border border-gold-500/22 bg-gold-500/8">
                      <Icon
                        className="size-5 text-gold-500"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                    <h3 className="mt-7 font-display text-xl font-bold tracking-[-0.02em] text-snow">
                      {item.title}
                    </h3>
                    <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-ice-300/60">
                      {item.body}
                    </p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <BeforeAfter />

      {/* Seasonal pricing */}
      <section className="section relative overflow-hidden bg-navy-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-35" />
        <div className="shell relative">
          <Reveal>
            <GlassCard className="p-10 md:p-16" tilt={false}>
              <div className="max-w-2xl">
                <h2 className="text-display-md text-snow">
                  {t("pricingTitle")}
                </h2>
                <p className="mt-7 text-lead text-ice-300/65">
                  {t("pricingBody")}
                </p>
                <ButtonLink
                  href="/estimate"
                  variant="primary"
                  size="lg"
                  className="mt-11"
                >
                  {tc("estimate")}
                  <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
                </ButtonLink>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
