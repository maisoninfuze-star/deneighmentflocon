import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  SquareParking,
  Truck,
  Footprints,
  Droplets,
  ArrowUpFromLine,
  ClipboardList,
  ArrowRight,
  Check,
} from "lucide-react";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = [
  SquareParking,
  Truck,
  Footprints,
  Droplets,
  ArrowUpFromLine,
  ClipboardList,
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "commercial", href: "/commercial" });
}

export default async function CommercialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("commercial");
  const tc = await getTranslations("cta");
  const services = t.raw("services") as { title: string; body: string }[];
  const clients = t.raw("clients") as string[];

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

      {/* Services */}
      <section className="section relative overflow-hidden bg-navy-950">
        <div className="shell relative">
          <SectionHeading title={t("servicesTitle")} />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Reveal key={s.title} delay={(i % 3) * 0.08}>
                  <GlassCard className="h-full p-8">
                    <span className="flex size-12 items-center justify-center rounded-xl border border-gold-500/22 bg-gold-500/8">
                      <Icon
                        className="size-5 text-gold-500"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                    <h3 className="mt-7 font-display text-xl font-bold tracking-[-0.02em] text-snow">
                      {s.title}
                    </h3>
                    <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-ice-300/60">
                      {s.body}
                    </p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we serve + SLA */}
      <section className="section relative overflow-hidden bg-navy-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-30" />
        <div className="shell relative grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading title={t("clientsTitle")} />
            <RevealGroup className="mt-12 grid gap-2.5 sm:grid-cols-2" stagger={0.05}>
              {clients.map((c) => (
                <RevealItem key={c}>
                  <span className="flex items-center gap-3 rounded-xl border border-ice-300/10 bg-white/4 px-5 py-4 text-[0.9375rem] text-ice-300/75 backdrop-blur-xl">
                    <Check
                      className="size-4 shrink-0 text-gold-500"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {c}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal delay={0.12} className="lg:self-center">
            <GlassCard className="p-9 md:p-12" tilt={false}>
              <span className="eyebrow text-gold-500">{t("slaTitle")}</span>
              <p className="mt-7 text-lead text-ice-300/70">{t("slaBody")}</p>
              <ButtonLink
                href="/contact"
                variant="glass"
                size="lg"
                className="mt-10"
              >
                {tc("learnMore")}
                <ArrowRight className="size-4" />
              </ButtonLink>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
