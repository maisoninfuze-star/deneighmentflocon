import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/routing";
import type { Pathnames } from "@/i18n/routing";
import { site, type Locale } from "@/lib/site";

/**
 * Builds page metadata with the correct canonical and hreflang pair.
 * `key` selects the namespace under `meta` in the message files.
 */
export async function buildMetadata({
  locale,
  key,
  href,
}: {
  locale: Locale;
  key: string;
  href: Pathnames;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${key}` });

  const path = getPathname({ locale, href });
  const frPath = getPathname({ locale: "fr", href });
  const enPath = getPathname({ locale: "en", href });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: path,
      languages: { "fr-CA": frPath, "en-CA": enPath },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      title: t("title"),
      description: t("description"),
      url: `${site.url}${path}`,
    },
  };
}
