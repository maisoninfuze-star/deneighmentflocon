import "server-only";
import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { site } from "@/lib/site";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Owner-editable site content.
 *
 * These are the facts the owner is most likely to change without a developer:
 * contact details, service areas, the headline statistics, the number of
 * remaining seasonal spots, and a site-wide announcement banner (storm mode).
 *
 * The public site reads them through `getSettings()`, which merges any stored
 * overrides on top of the defaults in `site.ts`. Nothing here can break the
 * build — a missing store, a malformed file, or a validation failure all fall
 * back to the defaults.
 */

export const settingsSchema = z.object({
  phone: z.string().trim().min(6).max(40),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/),
  email: z.string().trim().email().max(254),
  hours: z.string().trim().min(1).max(60),
  areas: z.array(z.string().trim().min(1).max(60)).min(1).max(40),
  stats: z.object({
    properties: z.coerce.number().int().min(0).max(1_000_000),
    years: z.coerce.number().int().min(0).max(200),
    responseHours: z.coerce.number().int().min(1).max(72),
    spotsRemaining: z.coerce.number().int().min(0).max(9999),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    fr: z.string().trim().max(200),
    en: z.string().trim().max(200),
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

/** Display phone → dialable, e.g. "(514) 813-2297" → "+15148132297". */
export function phoneToRaw(display: string) {
  const d = display.replace(/\D/g, "");
  return `+${d.length === 10 ? "1" : ""}${d}`;
}

export const defaultSettings: SiteSettings = {
  phone: site.phone,
  whatsapp: site.whatsapp,
  email: site.email,
  hours: site.hours,
  areas: [...site.areas],
  stats: {
    properties: 1200,
    years: new Date().getFullYear() - site.foundedYear,
    responseHours: 3,
    spotsRemaining: 12,
  },
  announcement: {
    enabled: false,
    fr: "",
    en: "",
  },
};

const SUPA_TABLE = "site_settings";
const SUPA_ID = "site";
const LOCAL_FILE = path.join(process.cwd(), ".data", "settings.json");

/**
 * Merged settings for the current request. Cached so the many public
 * components that need contact info or areas trigger only one read.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const stored = await readStored();
  if (!stored) return defaultSettings;

  // Merge defensively: a stored blob written by an older schema version may be
  // missing fields, so each section falls back to its default.
  return {
    ...defaultSettings,
    ...stored,
    stats: { ...defaultSettings.stats, ...stored.stats },
    announcement: { ...defaultSettings.announcement, ...stored.announcement },
    areas: stored.areas?.length ? stored.areas : defaultSettings.areas,
  };
});

export async function saveSettings(input: unknown): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "validation_failed" };
  }

  const supabase = getServiceSupabase();
  if (supabase) {
    const { error } = await supabase.from(SUPA_TABLE).upsert({
      id: SUPA_ID,
      data: parsed.data,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[settings] supabase upsert failed", error);
      return { ok: false, error: "storage_failed" };
    }
    return { ok: true };
  }

  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(parsed.data, null, 2), "utf8");
    return { ok: true };
  } catch (err) {
    console.error("[settings] local write failed", err);
    return { ok: false, error: "storage_failed" };
  }
}

/* ------------------------------------------------------------------ */

async function readStored(): Promise<Partial<SiteSettings> | null> {
  const supabase = getServiceSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from(SUPA_TABLE)
      .select("data")
      .eq("id", SUPA_ID)
      .maybeSingle();
    if (error) {
      console.error("[settings] supabase read failed", error);
      return null;
    }
    return (data?.data as Partial<SiteSettings>) ?? null;
  }

  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as Partial<SiteSettings>;
  } catch {
    return null;
  }
}
