/**
 * Client-safe lead types and constants.
 *
 * `leads.ts` reads the filesystem (node:fs), so it can only be imported by
 * server code. Anything a client component needs — the status union, the
 * ordered status list, the row shape — lives here instead, with no runtime
 * dependencies, so bundling it into the browser is safe.
 */

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
];

export type Lead = {
  reference: string;
  status: LeadStatus;
  locale: "fr" | "en";
  service_type: string;
  property_type: string;
  vehicles: number;
  /** Driveway covered by a Tempo car shelter (abri d'auto). */
  tempo: boolean;
  walkways: boolean;
  garage: boolean;
  stairs: boolean;
  sidewalk: boolean;
  deicing: boolean;
  obstacles: string | null;
  notes: string | null;
  /** The owner's private notes, added from the dashboard. */
  admin_notes?: string | null;
  photos: { url: string; name: string; size: number; type: string }[];
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  created_at: string;
};
