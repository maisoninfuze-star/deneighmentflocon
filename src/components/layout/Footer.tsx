import { getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { site } from "@/lib/site";
import { getSettings, phoneToRaw } from "@/lib/settings";
import { toTelHref } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Snowflake } from "@/components/ui/Snowflake";

const SERVICE_LINKS = [
  { href: "/residential", key: "residential" },
  { href: "/commercial", key: "commercial" },
  { href: "/emergency", key: "emergency" },
  { href: "/services", key: "services" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", key: "about" },
  { href: "/testimonials", key: "testimonials" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("contact");
  const { phone, email, areas, hours } = await getSettings();

  return (
    <footer className="relative overflow-hidden border-t border-ice-300/8 bg-navy-950">
      {/* Cold light bleeding up from the horizon */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] opacity-45 aurora"
      />

      <div className="shell-wide relative py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand + contact */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-ice-300/65">
              {t("tagline")}
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={toTelHref(phoneToRaw(phone))}
                className="group flex items-start gap-3.5 transition-colors duration-300"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-gold-500/25 bg-gold-500/10 text-gold-400 transition-colors duration-400 group-hover:bg-gold-500/20">
                  <Phone className="size-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-lg font-bold tracking-[-0.02em] text-snow transition-colors duration-300 group-hover:text-gold-400">
                    {phone}
                  </span>
                  <span className="text-xs text-ice-300/50">
                    {t("callAnytime")}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${email}`}
                className="group flex items-start gap-3.5"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-ice-300/15 bg-white/5 text-ice-400">
                  <Mail className="size-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-[0.9375rem] text-snow transition-colors duration-300 group-hover:text-gold-400">
                    {email}
                  </span>
                  <span className="text-xs text-ice-300/50">
                    {tc("emailNote")}
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-ice-300/15 bg-white/5 text-ice-400">
                  <MapPin className="size-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-[0.9375rem] text-snow">
                    {site.address.locality}, {site.address.regionFull}
                  </span>
                  <span className="text-xs text-ice-300/50">
                    {tc("areaNote")}
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-ice-300/15 bg-white/5 text-ice-400">
                  <Clock className="size-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-[0.9375rem] text-snow">
                    {hours}
                  </span>
                  <span className="text-xs text-ice-300/50">
                    {tc("hoursNote")}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <FooterColumn title={t("services")} links={SERVICE_LINKS} tn={tn} />
          <FooterColumn title={t("company")} links={COMPANY_LINKS} tn={tn} />

          <div>
            <h3 className="eyebrow text-ice-400/70">{t("legal")}</h3>
            <ul className="mt-5 space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-block py-1.5 text-[0.9375rem] text-ice-300/65 transition-colors duration-300 hover:text-snow"
                  >
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="eyebrow mt-10 text-ice-400/70">{t("areasServed")}</h3>
            <p className="mt-5 text-sm leading-relaxed text-ice-300/55">
              {areas.join(" · ")}
            </p>
          </div>
        </div>

        {/* Baseline */}
        <div className="mt-18 flex flex-col gap-5 border-t border-ice-300/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ice-300/45">
            © {new Date().getFullYear()} {site.legalName}. {t("rights")}
          </p>
          <p className="flex items-center gap-2 text-xs text-ice-300/45">
            <Snowflake className="size-3.5 text-gold-500/60" strokeWidth={8} />
            {t("builtIn")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  tn,
}: {
  title: string;
  links: readonly { href: string; key: string }[];
  tn: (key: string) => string;
}) {
  return (
    <div>
      <h3 className="eyebrow text-ice-400/70">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              // @ts-expect-error — href is a narrowed literal from the const arrays above
              href={l.href}
              className="inline-block py-1.5 text-[0.9375rem] text-ice-300/65 transition-colors duration-300 hover:text-snow"
            >
              {tn(l.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
