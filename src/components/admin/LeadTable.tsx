"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ImageIcon,
  ChevronDown,
  Inbox,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { site } from "@/lib/site";
import { toTelHref, cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/leads-shared";
import { saveLeadNotes, removeLead } from "@/app/admin/actions";
import { StatusBadge, STATUS_LABELS } from "./StatusBadge";
import { StatusControl } from "./StatusControl";

const SERVICE_LABELS: Record<string, string> = {
  residential: "Résidentiel",
  commercial: "Commercial",
  emergency: "Urgence",
  seasonal: "Saisonnier",
};

const SERVICE_FILTERS = ["all", "residential", "commercial", "emergency", "seasonal"] as const;
const STATUS_FILTERS = ["all", "new", "contacted", "quoted", "won", "lost"] as const;

/**
 * Lead list. Search, filter by service and status, expand a row to see the
 * full request, change its status, keep private notes, or delete it. Every
 * open row leads directly to a phone, WhatsApp, email or map.
 */
export function LeadTable({
  leads,
  initialOpenRef,
}: {
  leads: Lead[];
  initialOpenRef?: string;
}) {
  const [query, setQuery] = useState("");
  const [service, setService] = useState<(typeof SERVICE_FILTERS)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [openRef, setOpenRef] = useState<string | null>(initialOpenRef ?? null);
  const openRowRef = useRef<HTMLLIElement>(null);

  // Deep link from the dashboard (?ref=…) — scroll the opened row into view.
  useEffect(() => {
    if (initialOpenRef && openRowRef.current) {
      openRowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (service !== "all" && l.service_type !== service) return false;
      if (status !== "all" && l.status !== status) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.city, l.address, l.reference]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, query, service, status]);

  return (
    <div>
      {/* Search */}
      <label className="relative block sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ice-300/40"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, une ville, une référence…"
          aria-label="Rechercher"
          className="w-full rounded-full border border-ice-300/12 bg-white/4 py-2.5 pl-11 pr-4 text-sm text-snow placeholder:text-ice-300/35 transition-colors duration-300 hover:border-ice-300/22 focus:border-gold-500/50 focus:outline-none"
        />
      </label>

      {/* Filters */}
      <div className="mt-4 space-y-2.5">
        <FilterRow
          options={SERVICE_FILTERS}
          value={service}
          onChange={setService}
          label={(f) => (f === "all" ? "Tous les services" : SERVICE_LABELS[f])}
        />
        <FilterRow
          options={STATUS_FILTERS}
          value={status}
          onChange={setStatus}
          label={(f) => (f === "all" ? "Tous les statuts" : STATUS_LABELS[f as LeadStatus])}
        />
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-ice-300/10 bg-white/3 p-16 text-center">
          <Inbox className="mx-auto size-9 text-ice-400/40" strokeWidth={1.25} aria-hidden />
          <p className="mt-5 font-display text-lg font-bold text-snow">
            {leads.length === 0 ? "Aucune demande pour l'instant" : "Aucun résultat"}
          </p>
          <p className="mt-2 text-sm text-ice-300/50">
            {leads.length === 0
              ? "Les nouvelles demandes apparaîtront ici automatiquement."
              : "Essayez un autre terme ou un autre filtre."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2.5">
          {filtered.map((lead) => {
            const open = openRef === lead.reference;
            return (
              <li
                key={lead.reference}
                ref={open && lead.reference === initialOpenRef ? openRowRef : undefined}
                className="overflow-hidden rounded-2xl border border-ice-300/10 bg-white/4"
              >
                <button
                  type="button"
                  onClick={() => setOpenRef(open ? null : lead.reference)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors duration-300 hover:bg-white/3 sm:gap-5 sm:p-5"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-500/22 bg-gold-500/8 font-display text-xs font-bold text-gold-500"
                    aria-hidden
                  >
                    {lead.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-snow">{lead.name}</span>
                      <StatusBadge status={lead.status} />
                      <span className="hidden rounded-full border border-ice-300/12 px-2.5 py-0.5 text-[0.6875rem] text-ice-300/60 sm:inline">
                        {SERVICE_LABELS[lead.service_type] ?? lead.service_type}
                      </span>
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-ice-300/48">
                      <span>{lead.city}</span>
                      {lead.tempo && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="text-gold-400/80">Tempo</span>
                        </>
                      )}
                      <span aria-hidden>·</span>
                      <time dateTime={lead.created_at}>
                        {new Date(lead.created_at).toLocaleDateString("fr-CA", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      {lead.photos.length > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="size-3" aria-hidden />
                            {lead.photos.length}
                          </span>
                        </>
                      )}
                    </span>
                  </span>

                  <span className="hidden font-mono text-xs text-ice-300/35 md:block">
                    {lead.reference}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-ice-300/45 transition-transform duration-400",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-ice-300/8 p-5 sm:p-6">
                        {/* Contact actions */}
                        <div className="flex flex-wrap gap-2.5">
                          <a
                            href={toTelHref(lead.phone)}
                            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors duration-300 hover:bg-gold-400"
                          >
                            <Phone className="size-3.5" aria-hidden />
                            {lead.phone}
                          </a>
                          <a
                            href={`https://wa.me/${waNumber(lead.phone)}?text=${encodeURIComponent(`Bonjour ${lead.name}, merci pour votre demande (${lead.reference}).`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-5 py-2.5 text-sm text-snow transition-colors duration-300 hover:bg-white/10"
                          >
                            <MessageCircle className="size-3.5" aria-hidden />
                            WhatsApp
                          </a>
                          <a
                            href={`mailto:${lead.email}?subject=${encodeURIComponent(`${site.name} — ${lead.reference}`)}`}
                            className="inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-5 py-2.5 text-sm text-snow transition-colors duration-300 hover:bg-white/10"
                          >
                            <Mail className="size-3.5" aria-hidden />
                            Courriel
                          </a>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(`${lead.address}, ${lead.city}, ${lead.postal_code}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-5 py-2.5 text-sm text-snow transition-colors duration-300 hover:bg-white/10"
                          >
                            <MapPin className="size-3.5" aria-hidden />
                            Carte
                          </a>
                        </div>

                        {/* Status */}
                        <div className="mt-7">
                          <StatusControl reference={lead.reference} current={lead.status} />
                        </div>

                        {/* Detail */}
                        <dl className="mt-7 grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail label="Type de propriété" value={lead.property_type} />
                          <Detail label="Véhicules" value={String(lead.vehicles)} />
                          <Detail label="Abri Tempo" value={lead.tempo ? "Oui" : "Non"} />
                          <Detail
                            label="À déneiger"
                            value={
                              ([
                                lead.walkways && "Allées",
                                lead.garage && "Porte de garage",
                                lead.stairs && "Escaliers",
                                lead.sidewalk && "Trottoir",
                                lead.deicing && "Déglaçage",
                              ].filter(Boolean) as string[]).join(", ") || "—"
                            }
                          />
                          <Detail label="Langue" value={lead.locale === "fr" ? "Français" : "English"} />
                          <Detail label="Adresse" value={`${lead.address}, ${lead.postal_code}`} />
                        </dl>

                        {lead.obstacles && <Block label="Obstacles" value={lead.obstacles} />}
                        {lead.notes && <Block label="Note du client" value={lead.notes} />}

                        {lead.photos.length > 0 && (
                          <div className="mt-6">
                            <p className="text-xs text-ice-300/45">Photos ({lead.photos.length})</p>
                            <ul className="mt-2.5 flex flex-wrap gap-2">
                              {lead.photos.map((p, i) =>
                                p.url ? (
                                  <li key={i}>
                                    <a
                                      href={p.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-ice-300/12 bg-white/4 px-3 py-2 text-xs text-ice-300/70 transition-colors duration-300 hover:text-gold-400"
                                    >
                                      <ImageIcon className="size-3" aria-hidden />
                                      {p.name}
                                    </a>
                                  </li>
                                ) : (
                                  <li
                                    key={i}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-ice-300/12 bg-white/4 px-3 py-2 text-xs text-ice-300/40"
                                    title="Fichier non téléversé — stockage non configuré"
                                  >
                                    <ImageIcon className="size-3" aria-hidden />
                                    {p.name} (non téléversé)
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Private notes */}
                        <NotesEditor reference={lead.reference} initial={lead.admin_notes ?? ""} />

                        {/* Danger zone */}
                        <div className="mt-8 flex justify-end border-t border-ice-300/8 pt-6">
                          <DeleteButton reference={lead.reference} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FilterRow<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300",
            value === opt
              ? "bg-gold-500 text-navy-950"
              : "border border-ice-300/12 bg-white/4 text-ice-300/60 hover:text-snow",
          )}
        >
          {label(opt)}
        </button>
      ))}
    </div>
  );
}

function NotesEditor({ reference, initial }: { reference: string; initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = value !== initial;

  const save = () => {
    startTransition(async () => {
      await saveLeadNotes(reference, value);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="mt-7">
      <label className="block">
        <span className="text-xs text-ice-300/45">Notes privées</span>
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          rows={2}
          placeholder="Vos notes internes sur ce client (non visibles par le client)…"
          className="mt-2 w-full resize-y rounded-xl border border-ice-300/12 bg-navy-950/40 p-4 text-sm text-snow placeholder:text-ice-300/30 transition-colors duration-300 focus:border-gold-500/50 focus:outline-none"
        />
      </label>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-4 py-2 text-xs text-snow transition-colors duration-300 hover:bg-white/10 disabled:opacity-45"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Save className="size-3.5" aria-hidden />
          )}
          Enregistrer
        </button>
        {saved && <span className="text-xs text-emerald-300">Enregistré ✓</span>}
      </div>
    </div>
  );
}

function DeleteButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const del = () => {
    startTransition(async () => {
      await removeLead(reference);
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/8 px-4 py-2 text-xs text-rose-300/90 transition-colors duration-300 hover:bg-rose-500/15"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Supprimer
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-ice-300/60">Supprimer définitivement ?</span>
      <button
        type="button"
        onClick={del}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-rose-500 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        Oui, supprimer
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full px-3 py-2 text-xs text-ice-300/60 hover:text-snow"
      >
        Annuler
      </button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ice-300/42">{label}</dt>
      <dd className="mt-0.5 text-sm text-snow/85">{value}</dd>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5">
      <p className="text-xs text-ice-300/42">{label}</p>
      <p className="mt-1.5 rounded-xl border border-ice-300/8 bg-navy-950/40 p-4 text-sm leading-relaxed text-ice-300/75">
        {value}
      </p>
    </div>
  );
}

/** 5145550142 → 15145550142 for wa.me. */
function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `1${d}` : d;
}
