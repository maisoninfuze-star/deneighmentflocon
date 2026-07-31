"use client";

import { useState, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type QA = { q: string; a: string };

/**
 * Single-open accordion. The trigger is a real <button> with aria-expanded and
 * aria-controls, so it works with a screen reader and the keyboard for free.
 */
export function Accordion({
  items,
  className,
  defaultOpen = null,
}: {
  items: QA[];
  className?: string;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  const reduced = useReducedMotion();

  return (
    <div className={cn("divide-y divide-ice-300/8 border-y border-ice-300/8", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "group/acc flex w-full items-start justify-between gap-8 py-7 text-left",
                  "transition-colors duration-400",
                )}
              >
                <span
                  className={cn(
                    "font-display text-lg font-bold tracking-[-0.02em] transition-colors duration-400 md:text-xl",
                    isOpen ? "text-gold-400" : "text-snow group-hover/acc:text-gold-400",
                  )}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    "transition-all duration-500 ease-(--ease-out-expo)",
                    isOpen
                      ? "rotate-45 border-gold-500/45 bg-gold-500/12 text-gold-400"
                      : "border-ice-300/15 text-ice-300/55 group-hover/acc:border-gold-500/35 group-hover/acc:text-gold-400",
                  )}
                >
                  <Plus className="size-4" strokeWidth={2} />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-8 pr-12 text-[1.0625rem] leading-relaxed text-ice-300/65">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
