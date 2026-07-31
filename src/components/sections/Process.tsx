"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Four steps down a vertical rail. The rail's gold fill is scrubbed by scroll
 * position, so the line literally draws itself as you read down the list.
 */
export function Process() {
  const t = useTranslations("process");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = t.raw("steps") as { title: string; body: string }[];

  return (
    <section className="section relative overflow-hidden bg-navy-900">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-30" />

      <div className="shell relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
        />

        <div ref={ref} className="relative mt-20 max-w-3xl lg:ml-auto lg:mt-24">
          {/* Rail — runs down the centre of the number badges (badge is 3rem
              wide, so its centre sits at 1.5rem = left-6). */}
          <div
            aria-hidden
            className="absolute bottom-6 left-6 top-6 w-px -translate-x-1/2 bg-ice-300/12"
          >
            <motion.div
              className="w-full bg-linear-to-b from-gold-500 to-gold-600"
              style={{ height: reduced ? "100%" : railHeight }}
            />
          </div>

          {/* Flex layout, not absolute positioning: the badge can't be absolutely
              positioned inside <Reveal> because Motion's transform on the wrapper
              would become its containing block and drop it onto the text. */}
          <ol className="space-y-14">
            {steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-6">
                <span
                  className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-gold-500/25 bg-navy-950 font-display text-lg font-bold text-gold-500"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Reveal delay={i * 0.05} className="min-w-0 flex-1 pt-1.5">
                  <h3 className="font-display text-display-sm text-snow">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-lead text-ice-300/62">
                    {step.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
