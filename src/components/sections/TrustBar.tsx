import { getTranslations } from "next-intl/server";
import { ShieldCheck, Navigation, MapPin, FileCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Counter } from "@/components/ui/Counter";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const PILLARS = [
  { icon: ShieldCheck, key: "insured" },
  { icon: Navigation, key: "gps" },
  { icon: MapPin, key: "local" },
  { icon: FileCheck, key: "contract" },
] as const;

/**
 * The first thing after the hero. Numbers, then the four reasons to trust them.
 * Gold is used only on the numerals and the icons — nowhere else in the section.
 */
export async function TrustBar() {
  const t = await getTranslations("trust");
  const { stats } = await getSettings();

  return (
    <section className="section relative overflow-hidden border-t border-ice-300/8 bg-navy-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-40" />

      <div className="shell relative">
        {/* ---- Numbers ---- */}
        <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          <RevealItem className="text-center lg:text-left">
            <p className="font-display text-display-md text-gradient-gold">
              <Counter to={stats.properties} suffix="+" />
            </p>
            <p className="mt-3 text-sm text-ice-300/55">{t("properties")}</p>
          </RevealItem>

          <RevealItem className="text-center lg:text-left">
            <p className="font-display text-display-md text-gradient-gold">24/7</p>
            <p className="mt-3 text-sm text-ice-300/55">{t("availability")}</p>
          </RevealItem>

          <RevealItem className="text-center lg:text-left">
            <p className="font-display text-display-md text-gradient-gold">
              &lt;<Counter to={stats.responseHours} suffix="h" />
            </p>
            <p className="mt-3 text-sm text-ice-300/55">{t("response")}</p>
          </RevealItem>

          <RevealItem className="text-center lg:text-left">
            <p className="font-display text-display-md text-gradient-gold">
              <Counter to={stats.years} suffix="+" />
            </p>
            <p className="mt-3 text-sm text-ice-300/55">{t("years")}</p>
          </RevealItem>
        </RevealGroup>

        {/* ---- Pillars ---- */}
        <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, key }, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <GlassCard className="h-full p-8">
                <Icon
                  className="size-6 text-gold-500"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-6 font-display text-lg font-bold tracking-[-0.02em] text-snow">
                  {t(key)}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ice-300/58">
                  {t(`${key}Body`)}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
