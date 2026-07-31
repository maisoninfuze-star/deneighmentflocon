import type { ReactNode } from "react";
import { Snowfall } from "@/components/Snowfall";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Standard page opener. Every interior page uses this so the transition from
 * the header into content has the same weight and rhythm site-wide.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  children,
  tone = "navy",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  children?: ReactNode;
  /** "gold" tints the atmosphere warm — used for the emergency page. */
  tone?: "navy" | "gold";
}) {
  const gold = tone === "gold";

  return (
    <section className="relative overflow-hidden pb-20 pt-40 md:pb-28 md:pt-52">
      {/* Atmosphere */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          gold ? "opacity-60" : "aurora opacity-70",
        )}
        style={
          gold
            ? {
                background:
                  "radial-gradient(70% 60% at 50% 0%, rgba(246,189,11,0.22) 0%, transparent 68%), radial-gradient(50% 45% at 15% 40%, rgba(10,68,114,0.5) 0%, transparent 75%)",
              }
            : undefined
        }
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-55">
        <Snowfall density={0.55} wind={0.24} interactive={false} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      <div className="shell relative">
        <div className="max-w-4xl">
          <Reveal>
            <p
              className={cn(
                "eyebrow flex items-center gap-3",
                gold ? "text-gold-400" : "text-gold-500",
              )}
            >
              <span className="h-px w-9 bg-gold-500" />
              {eyebrow}
            </p>
          </Reveal>

          <h1 className="mt-7 text-display-xl">
            <span className="text-gradient-ice">
              <RevealText text={title} />
            </span>
            {accent && (
              <>
                {" "}
                <span className="text-gradient-gold">
                  <RevealText text={accent} delay={0.12} />
                </span>
              </>
            )}
          </h1>

          {lead && (
            <Reveal delay={0.2}>
              <p className="mt-9 max-w-2xl text-lead text-ice-300/70">{lead}</p>
            </Reveal>
          )}

          {children && (
            <Reveal delay={0.3}>
              <div className="mt-11">{children}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
