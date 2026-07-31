import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Snowflake } from "@/components/ui/Snowflake";

/**
 * Closing call to action for interior pages. Quieter than the homepage's
 * golden finale — that moment should stay unique to the homepage.
 */
export function CtaBand() {
  const t = useTranslations("finalCta");
  const tc = useTranslations("cta");

  return (
    <section className="relative overflow-hidden border-t border-ice-300/8 bg-navy-900">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-45" />

      <div className="shell relative py-24 text-center md:py-32">
        <Reveal>
          <Snowflake
            className="mx-auto size-8 text-gold-500/70 animate-drift"
            strokeWidth={7}
          />
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mx-auto mt-9 max-w-3xl text-display-lg text-snow">
            {t("title")}{" "}
            <span className="text-gradient-gold">{t("titleAccent")}</span>
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-7 max-w-xl text-lead text-ice-300/65">
            {t("body")}
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <ButtonLink href="/estimate" variant="primary" size="lg">
              {tc("estimate")}
              <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
            </ButtonLink>
            <ButtonLink
              href={toTelHref(site.phoneRaw)}
              variant="glass"
              size="lg"
            >
              <Phone className="size-4" />
              {site.phone}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
