"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Phone, AlertTriangle } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { site } from "@/lib/site";
import { lenisRef } from "@/lib/lenis";
import { cn, toTelHref } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageToggle } from "./LanguageToggle";

import type { Pathnames } from "@/i18n/routing";

const NAV: readonly { href: Pathnames; key: string }[] = [
  { href: "/residential", key: "residential" },
  { href: "/commercial", key: "commercial" },
  { href: "/emergency", key: "emergency" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
];

/** Nav + home + services, in the order the mobile sheet lists them. */
const MOBILE_NAV: readonly { href: Pathnames; key: string }[] = [
  { href: "/", key: "home" },
  ...NAV,
  { href: "/services", key: "services" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header({
  phone,
  announcement,
}: {
  phone: string;
  announcement?: string;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("cta");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Glass only after the hero's first screen — at the top the header floats.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll (and Lenis) while the mobile menu is open.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (open) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenisRef.current?.start();
    };
  }, [open]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100",
          "focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-2.5",
          "focus:text-sm focus:font-semibold focus:text-navy-950",
        )}
      >
        {t("skipToContent")}
      </a>

      {/* The banner and nav share one fixed wrapper so the nav can never
          overlap the banner — the cinematic hero still sits behind both. */}
      <div className="fixed inset-x-0 top-0 z-50">
        {announcement?.trim() && (
          <div className="bg-gold-500 text-navy-950">
            <div className="shell-wide flex h-9 items-center justify-center gap-2.5">
              <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
              <p className="truncate text-[0.8125rem] font-semibold tracking-[-0.01em]">
                {announcement}
              </p>
            </div>
          </div>
        )}

      <header
        className={cn(
          "transition-all duration-700 ease-(--ease-out-expo)",
          scrolled
            ? "border-b border-ice-300/10 bg-navy-950/72 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="shell-wide flex h-18 items-center justify-between gap-6 md:h-20">
          <Link
            href="/"
            aria-label={site.name}
            className="shrink-0 transition-opacity duration-300 hover:opacity-80"
          >
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("menu")}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-3.5 py-2 text-[0.875rem]",
                    "transition-colors duration-400 ease-(--ease-out-expo)",
                    active ? "text-snow" : "text-snow/62 hover:text-snow",
                  )}
                >
                  {t(item.key)}
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute inset-x-4 -bottom-px h-px bg-gold-500"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 md:gap-3">
            <LanguageToggle className="hidden sm:inline-flex" />

            <a
              href={toTelHref(phone)}
              className={cn(
                "hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 xl:inline-flex",
                "text-[0.875rem] font-medium text-snow/75",
                "transition-colors duration-400 hover:text-gold-400",
              )}
            >
              <Phone className="size-3.5" strokeWidth={2} />
              {phone}
            </a>

            <ButtonLink
              href="/estimate"
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
            >
              {tc("estimateShort")}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("close") : t("openMenu")}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full lg:hidden",
                "border border-ice-300/18 bg-white/6 text-snow backdrop-blur-xl",
                "transition-colors duration-300 hover:bg-white/12",
              )}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-0 z-40 bg-navy-950/96 backdrop-blur-2xl lg:hidden"
          >
            {/* `overflow-y-auto` + `m-auto` on the inner block: the menu
                centres when it fits and scrolls when it doesn't. With
                `justify-center` alone, taller content was clipped at both
                ends and the language toggle became unreachable. */}
            <div className="shell flex h-full flex-col overflow-y-auto overscroll-contain pt-24 pb-12">
              <div className="m-auto w-full">
              <nav className="flex flex-col gap-1" aria-label={t("menu")}>
                {MOBILE_NAV.map(
                  (item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 + i * 0.045, duration: 0.7, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        // Closed here rather than in an effect on `pathname`:
                        // tapping the link is the actual intent to dismiss.
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block border-b border-ice-300/8 py-4",
                          "font-display text-3xl font-bold tracking-[-0.03em]",
                          "transition-colors duration-300",
                          pathname === item.href
                            ? "text-gold-400"
                            : "text-snow hover:text-gold-400",
                        )}
                      >
                        {t(item.key)}
                      </Link>
                    </motion.div>
                  ),
                )}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.7, ease: EASE }}
                className="mt-10 flex flex-col gap-3"
              >
                <ButtonLink href="/estimate" variant="primary" size="lg">
                  {tc("estimate")}
                </ButtonLink>
                <ButtonLink
                  href={toTelHref(phone)}
                  variant="glass"
                  size="lg"
                >
                  <Phone className="size-4" />
                  {phone}
                </ButtonLink>
                <LanguageToggle className="mt-2 self-start sm:hidden" />
              </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
