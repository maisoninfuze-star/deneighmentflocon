import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";

import { isAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Logo } from "@/components/ui/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "@/app/admin/actions";

/**
 * The authenticated admin shell. This route group's layout is the single
 * auth gate for every dashboard page — the login route lives outside it.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const storage = isSupabaseConfigured ? "Supabase" : "Stockage local";

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ice-300/8 bg-navy-950 p-6 lg:flex">
        <Link href="/admin" className="px-2">
          <Logo />
        </Link>

        <div className="mt-10 flex-1">
          <AdminNav layout="sidebar" />
        </div>

        <div className="space-y-1 border-t border-ice-300/8 pt-5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-ice-300/55 transition-colors duration-300 hover:bg-white/5 hover:text-snow"
          >
            <ExternalLink className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
            Voir le site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-ice-300/55 transition-colors duration-300 hover:bg-white/5 hover:text-snow"
            >
              <LogOut className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
              Déconnexion
            </button>
          </form>
          <p className="px-4 pt-3 text-xs text-ice-300/30">{storage}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-ice-300/8 bg-navy-950/85 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/admin">
            <Logo compact />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Déconnexion"
              className="flex size-9 items-center justify-center rounded-full border border-ice-300/15 bg-white/5 text-ice-300/65 transition-colors duration-300 hover:text-snow"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
        <div className="border-t border-ice-300/8 px-4 py-2.5">
          <AdminNav layout="bar" />
        </div>
      </header>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
