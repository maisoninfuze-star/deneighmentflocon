"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Trash2,
  Loader2,
  Check,
  MessageSquare,
} from "lucide-react";

import { toTelHref, cn } from "@/lib/utils";
import type { ContactMessage, ContactStatus } from "@/lib/contacts";
import { setContactStatus, removeContact } from "@/app/admin/actions";

const STATUS_STYLE: Record<ContactStatus, string> = {
  new: "bg-gold-500/15 text-gold-300 border-gold-500/25",
  read: "bg-ice-400/12 text-ice-300 border-ice-400/25",
  replied: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const STATUS_LABEL: Record<ContactStatus, string> = {
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
};

export function ContactList({ contacts }: { contacts: ContactMessage[] }) {
  if (contacts.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-ice-300/10 bg-white/3 p-16 text-center">
        <MessageSquare className="mx-auto size-9 text-ice-400/40" strokeWidth={1.25} aria-hidden />
        <p className="mt-5 font-display text-lg font-bold text-snow">Aucun message</p>
        <p className="mt-2 text-sm text-ice-300/50">
          Les messages du formulaire de contact apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {contacts.map((c) => (
        <ContactCard key={c.id} contact={c} />
      ))}
    </ul>
  );
}

function ContactCard({ contact: c }: { contact: ContactMessage }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const mark = (status: ContactStatus) =>
    startTransition(async () => {
      await setContactStatus(c.id, status);
      router.refresh();
    });

  const del = () =>
    startTransition(async () => {
      await removeContact(c.id);
      router.refresh();
    });

  return (
    <li className="rounded-2xl border border-ice-300/10 bg-white/4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-snow">{c.name}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium",
                STATUS_STYLE[c.status],
              )}
            >
              {STATUS_LABEL[c.status]}
            </span>
          </div>
          <time className="mt-1 block text-xs text-ice-300/45" dateTime={c.created_at}>
            {new Date(c.created_at).toLocaleDateString("fr-CA", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
        {pending && <Loader2 className="size-4 animate-spin text-gold-500" aria-hidden />}
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-xl border border-ice-300/8 bg-navy-950/40 p-4 text-sm leading-relaxed text-ice-300/78">
        {c.message}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <a
          href={toTelHref(c.phone)}
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition-colors duration-300 hover:bg-gold-400"
        >
          <Phone className="size-3.5" aria-hidden />
          {c.phone}
        </a>
        <a
          href={`mailto:${c.email}`}
          className="inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-4 py-2 text-xs text-snow transition-colors duration-300 hover:bg-white/10"
        >
          <Mail className="size-3.5" aria-hidden />
          {c.email}
        </a>

        <span className="mx-1 hidden h-4 w-px bg-ice-300/12 sm:block" />

        {c.status !== "read" && (
          <button
            type="button"
            onClick={() => mark("read")}
            disabled={pending}
            className="rounded-full border border-ice-300/12 bg-white/4 px-4 py-2 text-xs text-ice-300/65 transition-colors duration-300 hover:text-snow disabled:opacity-50"
          >
            Marquer lu
          </button>
        )}
        {c.status !== "replied" && (
          <button
            type="button"
            onClick={() => mark("replied")}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-xs text-emerald-300 transition-colors duration-300 hover:bg-emerald-500/15 disabled:opacity-50"
          >
            <Check className="size-3" strokeWidth={3} aria-hidden />
            Répondu
          </button>
        )}

        <span className="ml-auto">
          {confirming ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={del}
                disabled={pending}
                className="rounded-full bg-rose-500/90 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full px-2.5 py-2 text-xs text-ice-300/60 hover:text-snow"
              >
                Annuler
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Supprimer"
              className="inline-flex size-8 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/8 text-rose-300/80 transition-colors duration-300 hover:bg-rose-500/15"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          )}
        </span>
      </div>
    </li>
  );
}
