import { useTranslations, useFormatter } from "next-intl";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import type { LegalDoc } from "@/content/legal";

/**
 * Shared shell for the privacy and terms pages: a narrow, high-contrast
 * reading column with a sticky table of contents on wide screens.
 */
export function LegalPage({
  eyebrow,
  title,
  doc,
}: {
  eyebrow: string;
  title: string;
  doc: LegalDoc;
}) {
  const t = useTranslations("legal");
  const format = useFormatter();

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={doc.intro} />

      <section className="section-tight relative overflow-hidden bg-navy-950 pb-32">
        <div className="shell relative grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20">
          {/* Contents */}
          <nav className="lg:sticky lg:top-32 lg:self-start" aria-label={title}>
            <p className="eyebrow text-ice-400/60">
              {t("lastUpdated")}
            </p>
            <p className="mt-2.5 text-sm text-ice-300/70">
              {format.dateTime(new Date(doc.updated), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <ol className="mt-9 space-y-2.5 border-t border-ice-300/8 pt-7">
              {doc.sections.map((s, i) => (
                <li key={s.heading}>
                  <a
                    href={`#s-${i}`}
                    className="block text-sm leading-snug text-ice-300/55 transition-colors duration-300 hover:text-gold-400"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Body */}
          <div className="max-w-2xl">
            {doc.sections.map((s, i) => (
              <Reveal key={s.heading} blur={false} y={18}>
                <section
                  id={`s-${i}`}
                  className="scroll-mt-32 border-b border-ice-300/8 py-10 first:pt-0 last:border-0"
                >
                  <h2 className="font-display text-display-sm text-snow">
                    {s.heading}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {s.body.map((p, j) => (
                      <p
                        key={j}
                        className="text-[1.0625rem] leading-relaxed text-ice-300/68"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
