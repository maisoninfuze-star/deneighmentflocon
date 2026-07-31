"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads-shared";
import { setLeadStatus } from "@/app/admin/actions";
import { STATUS_LABELS } from "./StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Segmented status selector. Writes through the server action, then refreshes
 * so the change is reflected everywhere (dashboard counts included).
 */
export function StatusControl({
  reference,
  current,
}: {
  reference: string;
  current: LeadStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (status: LeadStatus) => {
    if (status === current || pending) return;
    startTransition(async () => {
      await setLeadStatus(reference, status);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ice-300/42">Statut</span>
        {pending && (
          <Loader2 className="size-3 animate-spin text-gold-500" aria-hidden />
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Statut de la demande">
        {LEAD_STATUSES.map((status) => {
          const active = status === current;
          return (
            <button
              key={status}
              type="button"
              onClick={() => change(status)}
              aria-pressed={active}
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-300 disabled:opacity-60",
                active
                  ? "border-gold-500/50 bg-gold-500/15 font-semibold text-gold-300"
                  : "border-ice-300/12 bg-white/4 text-ice-300/60 hover:border-ice-300/25 hover:text-snow",
              )}
            >
              {active && <Check className="size-3" strokeWidth={3} aria-hidden />}
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
