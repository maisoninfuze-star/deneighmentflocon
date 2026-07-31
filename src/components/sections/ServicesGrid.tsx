import { useTranslations } from "next-intl";
import { Home, Building2, Siren, CalendarCheck, ArrowUpRight, Check } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const SERVICES = [
  { key: "residential", icon: Home, href: "/residential", featured: true },
  { key: "commercial", icon: Building2, href: "/commercial", featured: true },
  { key: "emergency", icon: Siren, href: "/emergency", featured: false },
  { key: "seasonal", icon: CalendarCheck, href: "/services", featured: false },
] as const;

export function ServicesGrid() {
  const t = useTranslations("services");

  return (
    <section className="section relative overflow-hidden bg-navy-950">
      {/* Snow drift dissolving the seam from the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-navy-900/60 to-transparent"
      />

      <div className="shell relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
          lead={t("subtitle")}
        />

        <div className="mt-20 grid gap-5 md:grid-cols-2">
          {SERVICES.map(({ key, icon: Icon, href, featured }, i) => (
            <Reveal key={key} delay={i * 0.09}>
              <Link href={href} className="block h-full">
                <GlassCard
                  className={cn(
                    "h-full p-9 md:p-11",
                    featured && "md:min-h-[26rem]",
                  )}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-6">
                      <span className="flex size-13 items-center justify-center rounded-xl border border-gold-500/22 bg-gold-500/8">
                        <Icon
                          className="size-6 text-gold-500"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </span>
                      <ArrowUpRight
                        className="size-5 shrink-0 text-ice-300/35 transition-all duration-500 ease-(--ease-out-expo) group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-gold-500"
                        aria-hidden
                      />
                    </div>

                    <p className="mt-8 eyebrow text-gold-500/75">
                      {t(`${key}.tagline`)}
                    </p>
                    <h3 className="mt-3 font-display text-display-sm text-snow">
                      {t(`${key}.name`)}
                    </h3>
                    <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ice-300/60">
                      {t(`${key}.description`)}
                    </p>

                    <ul className="mt-8 space-y-2.5 border-t border-ice-300/8 pt-7">
                      {t.raw(`${key}.features`).map((f: string) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-sm text-ice-300/68"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-gold-500"
                            strokeWidth={2}
                            aria-hidden
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
