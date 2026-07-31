"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "@/i18n/routing";
import type { Locale } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * FR | EN pill. The active language is carried by a sliding gold indicator
 * rather than a colour swap, so the control reads as one object in motion.
 *
 * next-intl persists the choice in the NEXT_LOCALE cookie, so the preference
 * survives across sessions without any client storage of our own.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale || pending) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error — params carry the dynamic segments for this route
        { pathname, params },
        { locale: next, scroll: false },
      );
    });
  };

  const options: Locale[] = ["fr", "en"];

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-full p-0.5",
        "border border-ice-300/18 bg-white/6 backdrop-blur-xl",
        pending && "opacity-70",
        className,
      )}
      role="group"
      aria-label="Language / Langue"
    >
      {options.map((opt) => {
        const active = opt === locale;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => switchTo(opt)}
            aria-current={active ? "true" : undefined}
            aria-label={opt === "fr" ? "Français" : "English"}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5",
              "text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
              "transition-colors duration-400 ease-(--ease-out-expo)",
              active ? "text-navy-950" : "text-snow/55 hover:text-snow/90",
            )}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gold-500"
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
