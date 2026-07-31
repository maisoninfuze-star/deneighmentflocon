import { getTranslations } from "next-intl/server";
import { MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { getSettings, phoneToRaw } from "@/lib/settings";
import { toTelHref } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Snowflake } from "@/components/ui/Snowflake";

export async function ServiceAreas() {
  const t = await getTranslations("areas");
  const { areas, phone } = await getSettings();

  return (
    <section className="section relative overflow-hidden bg-navy-950">
      <div className="shell relative grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        <div>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            accent={t("titleAccent")}
            lead={t("body")}
          />

          <Reveal delay={0.2}>
            <div className="mt-12 rounded-2xl border border-gold-500/18 bg-gold-500/5 p-7">
              <p className="text-[0.9375rem] font-semibold text-snow">
                {t("notListed")}
              </p>
              <p className="mt-2 text-[0.9375rem] text-ice-300/62">
                {t("callUs")}
              </p>
              <a
                href={toTelHref(phoneToRaw(phone))}
                className="mt-5 inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-[-0.02em] text-gold-400 transition-colors duration-300 hover:text-gold-300"
              >
                <Phone className="size-4" strokeWidth={2} />
                {phone}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Areas — a radial arrangement with Sainte-Dorothée at the centre */}
        <Reveal delay={0.15}>
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-50 aurora"
            />
            <RevealGroup className="flex flex-wrap gap-2.5" stagger={0.045}>
              {areas.map((area, i) => (
                <RevealItem key={area}>
                  <span
                    className={
                      i === 0
                        ? "inline-flex items-center gap-2.5 rounded-full border border-gold-500/35 bg-gold-500/12 px-5 py-3 text-[0.9375rem] font-semibold text-gold-300"
                        : "inline-flex items-center gap-2.5 rounded-full border border-ice-300/12 bg-white/4 px-5 py-3 text-[0.9375rem] text-ice-300/72 backdrop-blur-xl"
                    }
                  >
                    <MapPin
                      className={i === 0 ? "size-3.5 text-gold-500" : "size-3.5 text-ice-400/60"}
                      strokeWidth={2}
                      aria-hidden
                    />
                    {area}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>

            <div className="mt-10 flex items-center gap-4 text-xs text-ice-300/40">
              <Snowflake className="size-4 text-gold-500/50" strokeWidth={8} />
              <span className="h-px flex-1 bg-ice-300/10" />
              <span>{site.address.locality}, {site.address.regionFull}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
