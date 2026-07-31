import type { LeadStatus } from "@/lib/leads-shared";
import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  quoted: "Soumission",
  won: "Gagné",
  lost: "Perdu",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-gold-500/15 text-gold-300 border-gold-500/25",
  contacted: "bg-ice-400/12 text-ice-300 border-ice-400/25",
  quoted: "bg-navy-500/18 text-ice-200 border-navy-500/35",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-rose-500/12 text-rose-300/90 border-rose-500/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
