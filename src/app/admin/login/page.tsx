import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Lock, AlertCircle } from "lucide-react";

import {
  isAuthenticated,
  isAdminConfigured,
  verifyPassword,
  createSessionValue,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
} from "@/lib/admin-auth";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/admin");

  const { error } = await searchParams;
  const configured = isAdminConfigured();

  async function signIn(formData: FormData) {
    "use server";

    const password = String(formData.get("password") ?? "");
    if (!verifyPassword(password)) {
      redirect("/admin/login?error=1");
    }

    const value = createSessionValue();
    if (!value) redirect("/admin/login?error=config");

    const jar = await cookies();
    jar.set(ADMIN_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: ADMIN_MAX_AGE,
    });

    redirect("/admin");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>

        <div className="glass sheen relative rounded-2xl p-8">
          <span className="flex size-11 items-center justify-center rounded-xl border border-gold-500/22 bg-gold-500/10">
            <Lock className="size-5 text-gold-500" strokeWidth={1.5} aria-hidden />
          </span>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-snow">
            Tableau de bord
          </h1>
          <p className="mt-2 text-sm text-ice-300/55">
            Accès réservé à l&apos;administration.
          </p>

          {!configured && (
            <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-gold-500/30 bg-gold-500/8 p-4 text-sm text-gold-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Définissez <code className="font-mono">ADMIN_PASSWORD</code> et{" "}
                <code className="font-mono">ADMIN_SECRET</code> dans les
                variables d&apos;environnement pour activer l&apos;accès.
              </span>
            </p>
          )}

          <form action={signIn} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2.5 block text-sm font-medium text-ice-300/78">
                Mot de passe
              </span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                disabled={!configured}
                className="w-full rounded-xl border border-ice-300/14 bg-white/4 px-5 py-3.5 text-snow backdrop-blur-xl transition-colors duration-300 hover:border-ice-300/25 focus:border-gold-500/60 focus:outline-none disabled:opacity-50"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="flex items-center gap-2 text-sm text-gold-400"
              >
                <AlertCircle className="size-4" aria-hidden />
                {error === "config"
                  ? "Configuration incomplète."
                  : "Mot de passe incorrect."}
              </p>
            )}

            <button
              type="submit"
              disabled={!configured}
              className="w-full rounded-full bg-gold-500 px-7 py-3.5 font-semibold text-navy-950 transition-all duration-500 ease-(--ease-out-expo) hover:-translate-y-0.5 hover:bg-gold-400 disabled:pointer-events-none disabled:opacity-45"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
