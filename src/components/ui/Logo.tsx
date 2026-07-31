import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The brand logo — the real badge artwork (truck emblem + "Déneigement
 * Flocons" wordmark), transparent PNG so it sits on any surface.
 *
 * Used in the header, footer, admin and login. `compact` renders a smaller
 * mark (mobile bars); `variant` is kept for API compatibility with earlier
 * call sites and only nudges the drop shadow.
 */
export function Logo({
  className,
  variant = "light",
  compact = false,
}: {
  className?: string;
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/logo-full.png"
        alt="Déneigement Flocons"
        width={738}
        height={765}
        priority
        className={cn(
          "w-auto object-contain",
          compact ? "h-9" : "h-12",
          variant === "light"
            ? "drop-shadow-[0_2px_10px_rgba(1,18,31,0.45)]"
            : "drop-shadow-[0_2px_8px_rgba(1,18,31,0.15)]",
        )}
      />
    </span>
  );
}
