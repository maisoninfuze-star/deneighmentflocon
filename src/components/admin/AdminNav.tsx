"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Demandes", icon: Inbox, exact: false },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, exact: false },
  { href: "/admin/content", label: "Contenu du site", icon: SlidersHorizontal, exact: false },
] as const;

/**
 * Admin navigation. Renders as a vertical rail on desktop and a horizontal
 * scrollable bar on mobile — same links, same active logic.
 */
export function AdminNav({ layout }: { layout: "sidebar" | "bar" }) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (layout === "bar") {
    return (
      <nav
        className="flex gap-1 overflow-x-auto"
        aria-label="Navigation administration"
      >
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-300",
                active
                  ? "bg-gold-500 font-semibold text-navy-950"
                  : "text-ice-300/60 hover:bg-white/6 hover:text-snow",
              )}
            >
              <Icon className="size-4" strokeWidth={2} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigation administration">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-300",
              active
                ? "bg-gold-500/12 font-semibold text-gold-300"
                : "text-ice-300/60 hover:bg-white/5 hover:text-snow",
            )}
          >
            <Icon
              className={cn("size-[1.15rem]", active ? "text-gold-400" : "")}
              strokeWidth={1.75}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
