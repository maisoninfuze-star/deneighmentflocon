import { site, type Locale } from "@/lib/site";
import { getSettings, phoneToRaw } from "@/lib/settings";

/**
 * LocalBusiness structured data. Snow removal maps to Schema.org's
 * `SnowRemovalBusiness`, which Google understands for local service queries.
 */
export async function LocalBusinessSchema({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const { phone, email, areas } = await getSettings();

  const schema = {
    "@context": "https://schema.org",
    "@type": "SnowRemovalBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    description: fr
      ? "Déneigement résidentiel, commercial et d'urgence à Sainte-Dorothée, Laval et les environs. Service 24 h sur 24."
      : "Residential, commercial and emergency snow removal in Sainte-Dorothée, Laval and surrounding areas. Available 24/7.",
    url: site.url,
    telephone: phoneToRaw(phone),
    email: email,
    image: `${site.url}/brand/logo-original.png`,
    logo: `${site.url}/brand/logo-original.png`,
    priceRange: "$$",
    foundingDate: String(site.foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: areas.map((name) => ({
      "@type": "City",
      name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: fr ? "Services de déneigement" : "Snow removal services",
      itemListElement: [
        {
          key: "residential",
          fr: "Déneigement résidentiel",
          en: "Residential snow removal",
        },
        {
          key: "commercial",
          fr: "Déneigement commercial",
          en: "Commercial snow removal",
        },
        {
          key: "emergency",
          fr: "Déneigement d'urgence 24 h",
          en: "24/7 emergency snow removal",
        },
        {
          key: "seasonal",
          fr: "Contrat saisonnier",
          en: "Seasonal contract",
        },
      ].map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: fr ? s.fr : s.en },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Schema is fully static and authored here — no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
