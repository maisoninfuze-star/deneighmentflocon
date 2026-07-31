import { listLeads, summarise } from "@/lib/leads";
import { LeadTable } from "@/components/admin/LeadTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const { leads, source } = await listLeads();
  const stats = summarise(leads);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="eyebrow text-gold-500">Demandes d&apos;estimation</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-snow md:text-4xl">
          {stats.total} demande{stats.total > 1 ? "s" : ""}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-ice-300/55">
          {source === "local"
            ? "Lecture depuis le fichier local. Configurez Supabase pour une base de données partagée."
            : "Connecté à la base de données."}
        </p>
      </header>

      <div className="mt-10">
        <LeadTable leads={leads} initialOpenRef={ref} />
      </div>
    </div>
  );
}
