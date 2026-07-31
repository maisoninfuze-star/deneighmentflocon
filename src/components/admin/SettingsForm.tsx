"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  BarChart3,
  Megaphone,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { formatPhone, cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/settings";
import { saveSiteSettings } from "@/app/admin/actions";

/**
 * The owner's content editor. Everything here writes to the settings store and
 * shows on the public site immediately. Grouped into calm, titled cards so a
 * non-technical owner can find what they need without scrolling a wall of form.
 */
export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(initial);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"ok" | "error" | null>(null);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const setStat = (key: keyof SiteSettings["stats"], value: number) =>
    set("stats", { ...s.stats, [key]: value });

  const setAreas = (areas: string[]) => set("areas", areas);

  const submit = () => {
    startTransition(async () => {
      const payload: SiteSettings = {
        ...s,
        areas: s.areas.map((a) => a.trim()).filter(Boolean),
      };
      const res = await saveSiteSettings(payload);
      setResult(res.ok ? "ok" : "error");
      if (res.ok) {
        setS(payload);
        router.refresh();
        setTimeout(() => setResult(null), 3500);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Business info */}
      <Card icon={Phone} title="Coordonnées" desc="Affichées partout sur le site.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Téléphone" icon={Phone}>
            <input
              value={s.phone}
              onChange={(e) => set("phone", formatPhone(e.target.value))}
              inputMode="tel"
              className={inputCls}
            />
          </Field>
          <Field label="WhatsApp (chiffres seulement)" icon={MessageCircle}>
            <input
              value={s.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="15148132297"
              className={inputCls}
            />
          </Field>
          <Field label="Courriel" icon={Mail}>
            <input
              value={s.email}
              onChange={(e) => set("email", e.target.value)}
              inputMode="email"
              className={inputCls}
            />
          </Field>
          <Field label="Heures d'ouverture" icon={Clock}>
            <input
              value={s.hours}
              onChange={(e) => set("hours", e.target.value)}
              placeholder="24/7"
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      {/* Service areas */}
      <Card icon={MapPin} title="Secteurs desservis" desc="Le premier secteur est mis en évidence sur le site.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {s.areas.map((area, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={area}
                onChange={(e) => {
                  const next = [...s.areas];
                  next[i] = e.target.value;
                  setAreas(next);
                }}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setAreas(s.areas.filter((_, j) => j !== i))}
                aria-label={`Retirer ${area}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ice-300/12 bg-white/4 text-ice-300/55 transition-colors duration-300 hover:border-rose-500/30 hover:text-rose-300"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAreas([...s.areas, ""])}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-ice-300/15 bg-white/5 px-4 py-2 text-sm text-snow transition-colors duration-300 hover:bg-white/10"
        >
          <Plus className="size-4" aria-hidden />
          Ajouter un secteur
        </button>
      </Card>

      {/* Statistics */}
      <Card icon={BarChart3} title="Statistiques" desc="Les chiffres mis en avant sur la page d'accueil.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Propriétés déneigées">
            <input
              type="number"
              min={0}
              value={s.stats.properties}
              onChange={(e) => setStat("properties", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Années d'expérience">
            <input
              type="number"
              min={0}
              value={s.stats.years}
              onChange={(e) => setStat("years", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Délai d'intervention (h)">
            <input
              type="number"
              min={1}
              value={s.stats.responseHours}
              onChange={(e) => setStat("responseHours", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Places restantes">
            <input
              type="number"
              min={0}
              value={s.stats.spotsRemaining}
              onChange={(e) => setStat("spotsRemaining", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      {/* Announcement banner */}
      <Card
        icon={Megaphone}
        title="Bannière d'annonce"
        desc="Affiche un bandeau en haut du site — idéal pour une alerte tempête."
      >
        <label className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={s.announcement.enabled}
            onClick={() =>
              set("announcement", { ...s.announcement, enabled: !s.announcement.enabled })
            }
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
              s.announcement.enabled ? "bg-gold-500" : "bg-white/12",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform duration-300",
                s.announcement.enabled ? "translate-x-[1.375rem]" : "translate-x-0.5",
              )}
            />
          </button>
          <span className="text-sm text-ice-300/78">
            {s.announcement.enabled ? "Bannière activée" : "Bannière désactivée"}
          </span>
        </label>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Texte (français)">
            <input
              value={s.announcement.fr}
              onChange={(e) => set("announcement", { ...s.announcement, fr: e.target.value })}
              placeholder="Tempête en cours — service prioritaire actif."
              className={inputCls}
            />
          </Field>
          <Field label="Texte (anglais)">
            <input
              value={s.announcement.en}
              onChange={(e) => set("announcement", { ...s.announcement, en: e.target.value })}
              placeholder="Storm in progress — priority service active."
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-ice-300/12 bg-navy-900/90 p-4 backdrop-blur-2xl">
        <span className="min-w-0 text-sm">
          {result === "ok" && (
            <span className="inline-flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              Enregistré — visible sur le site.
            </span>
          )}
          {result === "error" && (
            <span className="inline-flex items-center gap-2 text-rose-300">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              Vérifiez les champs et réessayez.
            </span>
          )}
          {result === null && (
            <span className="text-ice-300/45">Les changements s&apos;appliquent immédiatement.</span>
          )}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-0.5 hover:bg-gold-400 disabled:pointer-events-none disabled:opacity-45"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-xl border border-ice-300/14 bg-white/4 px-4 py-3 text-[0.9375rem] text-snow placeholder:text-ice-300/30 transition-colors duration-300 hover:border-ice-300/25 focus:border-gold-500/60 focus:outline-none";

function Card({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ice-300/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/22 bg-gold-500/8">
          <Icon className="size-5 text-gold-500" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-snow">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-ice-300/50">{desc}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ice-300/60">
        {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden />}
        {label}
      </span>
      {children}
    </label>
  );
}
