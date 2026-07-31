import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { getSettings, phoneToRaw } from "@/lib/settings";
import { toTelHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { Snowfall } from "@/components/Snowfall";

/**
 * The end of the lighting story: the storm has broken and the frame turns gold.
 * This is the one section on the site where gold carries the background.
 */
export async function FinalCta() {
  const t = await getTranslations("finalCta");
  const tc = await getTranslations("cta");
  const { phone, stats } = await getSettings();

  return (
    <section className="relative overflow-hidden">
      {/* Golden morning */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-navy-950 via-navy-700 to-gold-500"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgba(255,221,107,0.9) 0%, rgba(246,189,11,0.35) 45%, transparent 75%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 opacity-45">
        <Snowfall density={0.5} wind={0.18} interactive={false} />
      </div>
      <div aria-hidden className="absolute inset-0 grain" />

      <div className="shell relative py-36 text-center md:py-48">
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-3 text-navy-900/70">
            <span className="h-px w-9 bg-navy-900/40" />
            {t("eyebrow")}
            <span className="h-px w-9 bg-navy-900/40" />
          </p>
        </Reveal>

        <h2 className="mx-auto mt-8 max-w-4xl text-display-xl text-navy-950">
          <RevealText text={t("title")} />{" "}
          <span className="block text-white drop-shadow-[0_4px_28px_rgba(1,18,31,0.3)]">
            <RevealText text={t("titleAccent")} delay={0.14} />
          </span>
        </h2>

        <Reveal delay={0.22}>
          <p className="mx-auto mt-9 max-w-xl text-lead text-navy-900/75">
            {t("body")}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-13 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/estimate" variant="navy" size="xl">
              {tc("estimate")}
              <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
            </ButtonLink>

            <span className="text-sm font-medium text-navy-900/50">{t("or")}</span>

            <ButtonLink
              href={toTelHref(phoneToRaw(phone))}
              size="xl"
              className="border-navy-900/22 bg-navy-950/8 text-navy-950 hover:border-navy-900/40 hover:bg-navy-950/14"
            >
              <Phone className="size-4" />
              {phone}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.38}>
          <p className="mt-10 flex items-center justify-center gap-2.5 text-sm text-navy-900/55">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-navy-900/50" />
              <span className="relative inline-flex size-2 rounded-full bg-navy-900/80" />
            </span>
            <span className="font-semibold text-navy-900/80">
              {stats.spotsRemaining}
            </span>{" "}
            {t("spots")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
