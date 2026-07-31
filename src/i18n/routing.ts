import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "@/lib/site";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // French is the default and lives at "/" — English at "/en".
  localePrefix: "as-needed",
  localeDetection: true,
  pathnames: {
    "/": "/",
    "/residential": { fr: "/residentiel", en: "/residential" },
    "/commercial": { fr: "/commercial", en: "/commercial" },
    "/emergency": { fr: "/urgence", en: "/emergency" },
    "/services": { fr: "/services", en: "/services" },
    "/estimate": { fr: "/soumission", en: "/estimate" },
    "/about": { fr: "/a-propos", en: "/about" },
    "/faq": { fr: "/faq", en: "/faq" },
    "/testimonials": { fr: "/temoignages", en: "/testimonials" },
    "/contact": { fr: "/contact", en: "/contact" },
    "/privacy": { fr: "/confidentialite", en: "/privacy" },
    "/terms": { fr: "/conditions", en: "/terms" },
  },
});

export type Pathnames = keyof typeof routing.pathnames;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
