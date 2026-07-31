/**
 * Single source of truth for business facts.
 * Nothing about the company should be hard-coded in a component.
 */

export const site = {
  name: "Déneigement Flocons",
  legalName: "Déneigement Flocons",
  phone: "(514) 813-2297",
  phoneRaw: "+15148132297",
  whatsapp: "15148132297",
  email: "info@deneigementflocons.ca",
  url: "https://deneigementflocons.ca",
  address: {
    locality: "Sainte-Dorothée",
    region: "QC",
    regionFull: "Québec",
    country: "CA",
    postalCode: "H7X",
  },
  areas: [
    "Sainte-Dorothée",
    "Laval",
    "Chomedey",
    "Fabreville",
    "Sainte-Rose",
    "Vimont",
    "Duvernay",
    "Laval-des-Rapides",
    "Îles-Laval",
    "Auteuil",
  ],
  /** Geographic centre of Sainte-Dorothée, used for LocalBusiness schema. */
  geo: { lat: 45.5385, lng: -73.8085 },
  hours: "24/7",
  foundedYear: 2015,
} as const;

export const stats = [
  { value: 1200, suffix: "+", key: "properties" },
  { value: 24, suffix: "/7", key: "availability", isText: true },
  { value: 3, suffix: "h", key: "response" },
  { value: 10, suffix: "+", key: "years" },
] as const;

export const serviceKeys = [
  "residential",
  "commercial",
  "emergency",
  "seasonal",
] as const;

export type ServiceKey = (typeof serviceKeys)[number];

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
