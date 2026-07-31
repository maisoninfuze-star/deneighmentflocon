import { site } from "@/lib/site";
import type { EstimateInput } from "@/lib/estimate-schema";

/**
 * Builds the pre-filled WhatsApp message the customer sends to the owner.
 *
 * Written in the customer's own language so the owner sees the request exactly
 * as the customer framed it, and so the customer can read what they're about
 * to send before they send it.
 */
export function buildWhatsAppMessage(
  data: EstimateInput,
  reference: string,
): string {
  const fr = data.locale === "fr";
  const L = fr ? LABELS_FR : LABELS_EN;

  const extras = [
    data.walkways && L.walkways,
    data.garage && L.garage,
    data.stairs && L.stairs,
    data.sidewalk && L.sidewalk,
    data.deicing && L.deicing,
  ].filter(Boolean);

  const lines = [
    `*${L.title}* — ${reference}`,
    "",
    `*${L.service}:* ${L.services[data.serviceType]}`,
    `*${L.propertyType}:* ${L.properties[data.propertyType]}`,
    "",
    `*${L.name}:* ${data.name}`,
    `*${L.phone}:* ${data.phone}`,
    `*${L.email}:* ${data.email}`,
    `*${L.address}:* ${data.address}, ${data.city}, ${data.postalCode}`,
    "",
    `*${L.vehicles}:* ${data.vehicles}`,
    `*${L.tempo}:* ${data.tempo ? L.yes : L.no}`,
  ];

  if (extras.length) lines.push(`*${L.included}:* ${extras.join(", ")}`);
  if (data.obstacles) lines.push("", `*${L.obstacles}:* ${data.obstacles}`);
  if (data.notes) lines.push("", `*${L.notes}:* ${data.notes}`);

  if (data.photos.length) {
    lines.push("", `*${L.photos}:* ${data.photos.length}`);
    data.photos.forEach((p, i) => lines.push(`${i + 1}. ${p.url}`));
  }

  return lines.join("\n");
}

/** wa.me link with the message pre-filled. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

const LABELS_FR = {
  title: "NOUVELLE DEMANDE D'ESTIMATION",
  service: "Service",
  propertyType: "Type de propriété",
  name: "Nom",
  phone: "Téléphone",
  email: "Courriel",
  address: "Adresse",
  vehicles: "Véhicules",
  tempo: "Abri Tempo",
  yes: "Oui",
  no: "Non",
  included: "À déneiger",
  obstacles: "Obstacles",
  notes: "Notes",
  photos: "Photos jointes",
  walkways: "allées",
  garage: "porte de garage",
  stairs: "escaliers",
  sidewalk: "trottoir",
  deicing: "déglaçage",
  services: {
    residential: "Résidentiel",
    commercial: "Commercial",
    emergency: "Urgence",
    seasonal: "Contrat saisonnier",
  },
  properties: {
    house: "Maison unifamiliale",
    semi: "Maison jumelée",
    townhouse: "Maison en rangée",
    duplex: "Duplex ou triplex",
    condo: "Condo",
    building: "Immeuble à logements",
    retail: "Commerce de détail",
    office: "Immeuble de bureaux",
    industrial: "Industriel ou entrepôt",
    other: "Autre",
  },
} as const;

const LABELS_EN = {
  title: "NEW ESTIMATE REQUEST",
  service: "Service",
  propertyType: "Property type",
  name: "Name",
  phone: "Phone",
  email: "Email",
  address: "Address",
  vehicles: "Vehicles",
  tempo: "Tempo shelter",
  yes: "Yes",
  no: "No",
  included: "To clear",
  obstacles: "Obstacles",
  notes: "Notes",
  photos: "Photos attached",
  walkways: "walkways",
  garage: "garage door",
  stairs: "stairs",
  sidewalk: "sidewalk",
  deicing: "de-icing",
  services: {
    residential: "Residential",
    commercial: "Commercial",
    emergency: "Emergency",
    seasonal: "Seasonal contract",
  },
  properties: {
    house: "Detached house",
    semi: "Semi-detached",
    townhouse: "Townhouse",
    duplex: "Duplex or triplex",
    condo: "Condo",
    building: "Apartment building",
    retail: "Retail",
    office: "Office building",
    industrial: "Industrial or warehouse",
    other: "Other",
  },
} as const;
