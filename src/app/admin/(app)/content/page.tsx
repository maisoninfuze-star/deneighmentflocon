import { getSettings } from "@/lib/settings";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <header>
        <p className="eyebrow text-gold-500">Contenu du site</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-snow md:text-4xl">
          Modifier le site
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] text-ice-300/55">
          Changez vos coordonnées, vos secteurs, vos statistiques ou activez une
          bannière d&apos;annonce. Tout s&apos;applique au site immédiatement —
          aucune compétence technique requise.
          {!isSupabaseConfigured &&
            " Les changements sont enregistrés localement en attendant la configuration de la base de données."}
        </p>
      </header>

      <div className="mt-10">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
