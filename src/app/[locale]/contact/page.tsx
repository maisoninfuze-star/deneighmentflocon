import { setRequestLocale, getTranslations } from "next-intl/server";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

import { site, type Locale } from "@/lib/site";
import { getSettings, phoneToRaw } from "@/lib/settings";
import { toTelHref } from "@/lib/utils";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return buildMetadata({ locale, key: "contact", href: "/contact" });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const { phone, whatsapp, email, areas, hours } = await getSettings();

  const channels = [
    {
      icon: Phone,
      label: t("phone"),
      value: phone,
      note: t("phoneNote"),
      href: toTelHref(phoneToRaw(phone)),
      primary: true,
    },
    {
      icon: MessageCircle,
      label: t("whatsapp"),
      value: phone,
      note: t("whatsappNote"),
      href: `https://wa.me/${whatsapp}`,
      primary: false,
    },
    {
      icon: Mail,
      label: t("email"),
      value: email,
      note: t("emailNote"),
      href: `mailto:${email}`,
      primary: false,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        lead={t("subtitle")}
      />

      <section className="section-tight relative overflow-hidden bg-navy-950 pb-32">
        <div className="shell relative grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* Channels.
              `min-w-0` is load-bearing: grid items default to min-width:auto,
              so the unbreakable email address would otherwise stretch the
              track past the viewport on a phone. */}
          <div className="min-w-0 space-y-4">
            {channels.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block"
                >
                  <GlassCard className="p-7">
                    <div className="flex items-start gap-5">
                      <span
                        className={
                          c.primary
                            ? "flex size-12 shrink-0 items-center justify-center rounded-xl border border-gold-500/28 bg-gold-500/12"
                            : "flex size-12 shrink-0 items-center justify-center rounded-xl border border-ice-300/14 bg-white/5"
                        }
                      >
                        <c.icon
                          className={c.primary ? "size-5 text-gold-500" : "size-5 text-ice-400"}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="eyebrow block text-ice-400/60">
                          {c.label}
                        </span>
                        {/* Steps down a size on narrow screens so the email
                            address fits on one line instead of breaking. */}
                        <span className="mt-2 block break-words font-display text-lg font-bold tracking-[-0.02em] text-snow transition-colors duration-300 group-hover/card:text-gold-400 sm:text-xl">
                          {c.value}
                        </span>
                        <span className="mt-1.5 block text-sm text-ice-300/52">
                          {c.note}
                        </span>
                      </span>
                    </div>
                  </GlassCard>
                </a>
              </Reveal>
            ))}

            <Reveal delay={0.24}>
              <GlassCard className="p-7" tilt={false}>
                <div className="flex items-start gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-ice-300/14 bg-white/5">
                    <MapPin className="size-5 text-ice-400" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span>
                    <span className="eyebrow block text-ice-400/60">{t("area")}</span>
                    <span className="mt-2 block text-[1.0625rem] text-snow">
                      {site.address.locality}, {site.address.regionFull}
                    </span>
                    <span className="mt-1.5 block text-sm text-ice-300/52">
                      {areas.join(" · ")}
                    </span>
                  </span>
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.3}>
              <GlassCard className="p-7" tilt={false}>
                <div className="flex items-start gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-ice-300/14 bg-white/5">
                    <Clock className="size-5 text-ice-400" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span>
                    <span className="eyebrow block text-ice-400/60">{t("hours")}</span>
                    <span className="mt-2 block text-[1.0625rem] text-snow">
                      {hours}
                    </span>
                    <span className="mt-1.5 block text-sm text-ice-300/52">
                      {t("hoursNote")}
                    </span>
                  </span>
                </div>
              </GlassCard>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.1} className="min-w-0">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
