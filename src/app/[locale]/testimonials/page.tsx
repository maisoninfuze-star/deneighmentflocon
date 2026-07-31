import { setRequestLocale, getTranslations } from "next-intl/server";
import { Quote, BadgeCheck } from "lucide-react";

import type { Locale } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";

type Item = { quote: string; name: string; role: string; service: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "testimonials", href: "/testimonials" });
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("testimonials");
  const items = t.raw("items") as Item[];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("subtitle")}
      />

      <section className="section-tight relative overflow-hidden bg-navy-950 pb-32">
        <div className="shell relative">
          {/* Masonry-ish columns so quotes of different lengths sit naturally */}
          <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
            {items.map((item, i) => (
              <div key={item.name} className="mb-5 break-inside-avoid">
                <Reveal delay={(i % 3) * 0.08}>
                  <GlassCard className="p-8" tilt={false}>
                    <Quote
                      className="size-6 text-gold-500/55"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <blockquote className="mt-6 text-[1.0625rem] leading-relaxed text-snow/88">
                      {item.quote}
                    </blockquote>
                    <footer className="mt-8 flex items-center gap-3.5 border-t border-ice-300/8 pt-6">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-500/22 bg-gold-500/8 font-display text-sm font-bold text-gold-500"
                        aria-hidden
                      >
                        {item.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-snow">
                          {item.name}
                          <BadgeCheck
                            className="size-4 shrink-0 text-gold-500"
                            strokeWidth={2}
                            aria-label={t("verified")}
                          />
                        </span>
                        <span className="block text-xs text-ice-300/52">
                          {item.role} · {item.service}
                        </span>
                      </span>
                    </footer>
                  </GlassCard>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
