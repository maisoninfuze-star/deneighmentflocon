"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Quote, BadgeCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

type Item = {
  quote: string;
  name: string;
  role: string;
  service: string;
};

/**
 * Two rows drifting in opposite directions. Pauses on hover so a quote can
 * actually be read, and falls back to a plain scrollable row under reduced
 * motion.
 */
export function TestimonialsMarquee() {
  const t = useTranslations("testimonials");
  const reduced = useReducedMotion();
  const items = t.raw("items") as Item[];

  const rowA = items.slice(0, 3);
  const rowB = items.slice(3);

  return (
    <section className="section relative overflow-hidden bg-navy-900">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-25" />

      <div className="shell relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
          lead={t("subtitle")}
          align="center"
        />
      </div>

      <div className="relative mt-18 space-y-5">
        {/* Edges fade so cards dissolve rather than getting cut off */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-navy-900 to-transparent md:w-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-navy-900 to-transparent md:w-40"
        />

        <MarqueeRow items={rowA} reduced={reduced} verified={t("verified")} />
        <MarqueeRow items={rowB} reduced={reduced} verified={t("verified")} reverse />
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  reduced,
  verified,
  reverse = false,
}: {
  items: Item[];
  reduced: boolean | null;
  verified: string;
  reverse?: boolean;
}) {
  if (reduced) {
    return (
      <div className="flex snap-x gap-5 overflow-x-auto px-5 pb-3">
        {items.map((item) => (
          <TestimonialCard key={item.name} item={item} verified={verified} />
        ))}
      </div>
    );
  }

  // Duplicated once so the -50% translation loops seamlessly.
  const doubled = [...items, ...items];

  return (
    <div className="group/row flex overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-5 pr-5 group-hover/row:[animation-play-state:paused]"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard
            key={`${item.name}-${i}`}
            item={item}
            verified={verified}
            aria-hidden={i >= items.length}
          />
        ))}
      </motion.div>
    </div>
  );
}

function TestimonialCard({
  item,
  verified,
  ...rest
}: {
  item: Item;
  verified: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="w-[min(88vw,26rem)] shrink-0" {...rest}>
      <GlassCard className="h-full p-8" tilt={false}>
        <Quote className="size-6 text-gold-500/55" strokeWidth={1.5} aria-hidden />
        <blockquote className="mt-6 text-[1.0625rem] leading-relaxed text-snow/88">
          {item.quote}
        </blockquote>
        <footer className="mt-8 flex items-center gap-3.5 border-t border-ice-300/8 pt-6">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              "border border-gold-500/22 bg-gold-500/8",
              "font-display text-sm font-bold text-gold-500",
            )}
            aria-hidden
          >
            {item.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-snow">
              {item.name}
              <BadgeCheck
                className="size-4 shrink-0 text-gold-500"
                strokeWidth={2}
                aria-label={verified}
              />
            </span>
            <span className="block truncate text-xs text-ice-300/52">
              {item.role} · {item.service}
            </span>
          </span>
        </footer>
      </GlassCard>
    </div>
  );
}
