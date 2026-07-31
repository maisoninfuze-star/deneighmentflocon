import { setRequestLocale, getTranslations } from "next-intl/server";
import { Phone, AlertTriangle } from "lucide-react";

import { site, type Locale } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "emergency", href: "/emergency" });
}

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("emergency");
  const when = t.raw("when") as string[];
  const response = t.raw("response") as { title: string; body: string }[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("lead")}
        tone="gold"
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <ButtonLink
            href={toTelHref(site.phoneRaw)}
            variant="primary"
            size="xl"
          >
            <Phone className="size-5" />
            {site.phone}
          </ButtonLink>
          <span className="flex items-center gap-2.5 text-sm text-ice-300/60">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-500/70" />
              <span className="relative inline-flex size-2 rounded-full bg-gold-500" />
            </span>
            {t("available")}
          </span>
        </div>
      </PageHero>

      {/* When to call */}
      <section className="section relative overflow-hidden bg-navy-950">
        <div className="shell relative grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading title={t("whenTitle")} />
          </div>

          <RevealGroup className="space-y-3" stagger={0.06}>
            {when.map((item) => (
              <RevealItem key={item}>
                <div className="flex items-start gap-4 rounded-2xl border border-ice-300/10 bg-white/4 p-6 backdrop-blur-xl">
                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0 text-gold-500"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-[1.0625rem] leading-relaxed text-ice-300/78">
                    {item}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* What to expect — the response timeline */}
      <section className="section relative overflow-hidden bg-navy-900">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-35" />
        <div className="shell relative">
          <SectionHeading title={t("responseTitle")} align="center" />

          <ol className="mt-18 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {response.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.09}>
                  <GlassCard className="h-full p-8">
                    <span
                      className="font-display text-display-sm text-gradient-gold"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-6 font-display text-lg font-bold tracking-[-0.02em] text-snow">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-ice-300/60">
                      {step.body}
                    </p>
                  </GlassCard>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Emergency line — deliberately the loudest moment on the site */}
      <section className="relative overflow-hidden border-t border-gold-500/20">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-navy-900 via-navy-800 to-gold-600"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[70%]"
          style={{
            background:
              "radial-gradient(75% 100% at 50% 100%, rgba(255,206,46,0.85) 0%, transparent 72%)",
          }}
        />
        <div className="shell relative py-28 text-center md:py-36">
          <Reveal>
            <p className="eyebrow text-navy-900/70">{t("available")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={toTelHref(site.phoneRaw)}
              className="mt-8 block font-display text-display-xl text-navy-950 transition-opacity duration-400 hover:opacity-80"
            >
              {site.phone}
            </a>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 text-lead text-navy-900/70">{t("callBig")}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
