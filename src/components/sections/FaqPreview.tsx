import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion, type QA } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

/** The six most-asked questions. The rest live on /faq. */
export function FaqPreview() {
  const t = useTranslations("faq");
  const items = (t.raw("items") as QA[]).slice(0, 6);

  return (
    <section className="section relative overflow-hidden bg-navy-900">
      <div className="shell relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            accent={t("titleAccent")}
            lead={t("subtitle")}
          />
          <Reveal delay={0.2}>
            <Link
              href="/faq"
              className="group mt-10 inline-flex items-center gap-2.5 text-[0.9375rem] font-semibold text-gold-400 transition-colors duration-300 hover:text-gold-300"
            >
              {t("stillQuestions")}
              <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Accordion items={items} defaultOpen={0} />
        </Reveal>
      </div>
    </section>
  );
}
