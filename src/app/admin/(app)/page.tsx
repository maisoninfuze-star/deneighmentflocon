import Link from "next/link";
import {
  Inbox,
  TrendingUp,
  Trophy,
  Tent,
  ArrowRight,
  Phone,
} from "lucide-react";

import { listLeads, summarise } from "@/lib/leads";
import { listContacts } from "@/lib/contacts";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  residential: "Résidentiel",
  commercial: "Commercial",
  emergency: "Urgence",
  seasonal: "Saisonnier",
};

export default async function AdminDashboard() {
  const [{ leads }, { contacts }] = await Promise.all([
    listLeads(),
    listContacts(),
  ]);
  const stats = summarise(leads);
  const newMessages = contacts.filter((c) => c.status === "new").length;
  const recent = leads.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="eyebrow text-gold-500">Vue d&apos;ensemble</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-snow md:text-4xl">
          Bonjour 👋
        </h1>
        <p className="mt-2 text-[0.9375rem] text-ice-300/55">
          {stats.newCount > 0
            ? `Vous avez ${stats.newCount} nouvelle${stats.newCount > 1 ? "s" : ""} demande${stats.newCount > 1 ? "s" : ""} à traiter.`
            : "Aucune nouvelle demande pour l'instant."}
        </p>
      </header>

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Nouvelles demandes"
          value={stats.newCount}
          hint={`${stats.total} au total`}
          highlight
        />
        <StatCard
          icon={TrendingUp}
          label="7 derniers jours"
          value={stats.last7}
          hint="demandes reçues"
        />
        <StatCard
          icon={Trophy}
          label="Contrats gagnés"
          value={stats.won}
          hint={`sur ${stats.total} demandes`}
        />
        <StatCard
          icon={Tent}
          label="Avec abri Tempo"
          value={stats.withTempo}
          hint={`sur ${stats.total} demandes`}
        />
      </div>

      {/* Quick links */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/leads"
          className="group flex items-center justify-between rounded-2xl border border-ice-300/10 bg-white/4 p-6 transition-colors duration-300 hover:border-ice-300/20 hover:bg-white/6"
        >
          <span>
            <span className="font-display text-lg font-bold text-snow">
              Toutes les demandes
            </span>
            <span className="mt-1 block text-sm text-ice-300/50">
              Rechercher, filtrer, suivre le statut
            </span>
          </span>
          <ArrowRight className="size-5 text-ice-300/40 transition-all duration-400 group-hover:translate-x-1 group-hover:text-gold-400" />
        </Link>
        <Link
          href="/admin/messages"
          className="group flex items-center justify-between rounded-2xl border border-ice-300/10 bg-white/4 p-6 transition-colors duration-300 hover:border-ice-300/20 hover:bg-white/6"
        >
          <span>
            <span className="flex items-center gap-2.5 font-display text-lg font-bold text-snow">
              Messages
              {newMessages > 0 && (
                <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[0.6875rem] font-medium text-gold-400">
                  {newMessages} nouveau{newMessages > 1 ? "x" : ""}
                </span>
              )}
            </span>
            <span className="mt-1 block text-sm text-ice-300/50">
              Messages du formulaire de contact
            </span>
          </span>
          <ArrowRight className="size-5 text-ice-300/40 transition-all duration-400 group-hover:translate-x-1 group-hover:text-gold-400" />
        </Link>
      </div>

      {/* Recent */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-snow">
            Demandes récentes
          </h2>
          <Link
            href="/admin/leads"
            className="text-sm text-gold-400 transition-colors duration-300 hover:text-gold-300"
          >
            Tout voir
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-ice-300/10 bg-white/3 p-12 text-center text-sm text-ice-300/50">
            Les nouvelles demandes apparaîtront ici automatiquement.
          </p>
        ) : (
          <ul className="mt-6 space-y-2.5">
            {recent.map((lead) => (
              <li key={lead.reference}>
                <Link
                  href={`/admin/leads?ref=${lead.reference}`}
                  className="flex items-center gap-4 rounded-2xl border border-ice-300/10 bg-white/4 p-4 transition-colors duration-300 hover:bg-white/6"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-500/22 bg-gold-500/8 font-display text-xs font-bold text-gold-500"
                    aria-hidden
                  >
                    {lead.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="truncate font-semibold text-snow">
                        {lead.name}
                      </span>
                      <StatusBadge status={lead.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ice-300/48">
                      {SERVICE_LABELS[lead.service_type] ?? lead.service_type} ·{" "}
                      {lead.city} ·{" "}
                      {new Date(lead.created_at).toLocaleDateString("fr-CA", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </span>
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, "")}`}
                    className="hidden shrink-0 items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 transition-colors duration-300 hover:bg-gold-400 sm:inline-flex"
                  >
                    <Phone className="size-3" aria-hidden />
                    Appeler
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-gold-500/25 bg-gold-500/8 p-6"
          : "rounded-2xl border border-ice-300/10 bg-white/4 p-6"
      }
    >
      <Icon
        className={highlight ? "size-5 text-gold-500" : "size-5 text-ice-400/70"}
        strokeWidth={1.5}
      />
      <p className="mt-5 font-display text-3xl font-extrabold tracking-[-0.03em] text-snow">
        {value.toLocaleString("fr-CA")}
      </p>
      <p className="mt-1.5 text-sm font-medium text-ice-300/72">{label}</p>
      <p className="mt-0.5 text-xs text-ice-300/40">{hint}</p>
    </div>
  );
}
