import { cn } from "@/lib/utils";
import { Reveal, RevealText } from "./Reveal";

/**
 * The standard section opener: eyebrow, two-tone headline, optional lead.
 * Used on every page so vertical rhythm stays identical throughout the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  lead,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: string;
  align?: "left" | "center";
  /** "dark" = on navy. "light" = on snow. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const centered = align === "center";
  const light = tone === "light";

  return (
    <div
      className={cn(
        "max-w-3xl",
        centered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p
            className={cn(
              "eyebrow flex items-center gap-3",
              centered && "justify-center",
              light ? "text-navy-700/70" : "text-gold-500",
            )}
          >
            <span
              className={cn(
                "h-px w-9",
                light ? "bg-navy-700/40" : "bg-gold-500",
              )}
            />
            {eyebrow}
          </p>
        </Reveal>
      )}

      <h2
        className={cn(
          "mt-6 text-display-lg",
          light ? "text-navy-950" : "text-snow",
        )}
      >
        <RevealText text={title} />
        {accent && (
          <>
            {" "}
            <span className={light ? "text-navy-600" : "text-gradient-gold"}>
              <RevealText text={accent} delay={0.12} />
            </span>
          </>
        )}
      </h2>

      {lead && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "mt-7 text-lead",
              centered && "mx-auto",
              light ? "text-navy-900/65" : "text-ice-300/68",
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
