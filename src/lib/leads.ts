import { promises as fs } from "node:fs";
import path from "node:path";
import { getServiceSupabase, ESTIMATES_TABLE } from "@/lib/supabase";
import type { Lead } from "@/lib/leads-shared";

// Re-exported so existing server imports of `@/lib/leads` keep working.
export { LEAD_STATUSES } from "@/lib/leads-shared";
export type { Lead, LeadStatus } from "@/lib/leads-shared";

const LOCAL_FILE = path.join(process.cwd(), ".leads", "estimates.jsonl");

/**
 * Reads leads from Supabase when configured, otherwise from the local JSONL
 * fallback the API route writes to. The dashboard works either way.
 */
export async function listLeads(): Promise<{
  leads: Lead[];
  source: "supabase" | "local";
}> {
  const supabase = getServiceSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from(ESTIMATES_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[leads] supabase read failed", error);
      return { leads: [], source: "supabase" };
    }
    return { leads: (data ?? []) as Lead[], source: "supabase" };
  }

  const leads = await readLocal();
  return { leads: leads.slice().reverse(), source: "local" };
}

/** Applies a partial update to one lead, in whichever store is active. */
export async function updateLead(
  reference: string,
  patch: Partial<Pick<Lead, "status" | "admin_notes">>,
): Promise<boolean> {
  const supabase = getServiceSupabase();

  if (supabase) {
    const { error } = await supabase
      .from(ESTIMATES_TABLE)
      .update(patch)
      .eq("reference", reference);
    if (error) {
      console.error("[leads] supabase update failed", error);
      return false;
    }
    return true;
  }

  return rewriteLocal((leads) =>
    leads.map((l) => (l.reference === reference ? { ...l, ...patch } : l)),
  );
}

export async function deleteLead(reference: string): Promise<boolean> {
  const supabase = getServiceSupabase();

  if (supabase) {
    const { error } = await supabase
      .from(ESTIMATES_TABLE)
      .delete()
      .eq("reference", reference);
    if (error) {
      console.error("[leads] supabase delete failed", error);
      return false;
    }
    return true;
  }

  return rewriteLocal((leads) => leads.filter((l) => l.reference !== reference));
}

export function summarise(leads: Lead[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return {
    total: leads.length,
    newCount: leads.filter((l) => l.status === "new").length,
    won: leads.filter((l) => l.status === "won").length,
    last7: leads.filter((l) => now - new Date(l.created_at).getTime() < 7 * day)
      .length,
    residential: leads.filter((l) => l.service_type === "residential").length,
    commercial: leads.filter((l) => l.service_type === "commercial").length,
    emergency: leads.filter((l) => l.service_type === "emergency").length,
    seasonal: leads.filter((l) => l.service_type === "seasonal").length,
    withTempo: leads.filter((l) => l.tempo).length,
  };
}

/* ------------------------------------------------------------------ */
/* Local JSONL helpers — stored oldest-first, one JSON object per line */
/* ------------------------------------------------------------------ */

async function readLocal(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Lead;
        } catch {
          return null;
        }
      })
      .filter((l): l is Lead => l !== null);
  } catch {
    return [];
  }
}

async function rewriteLocal(fn: (leads: Lead[]) => Lead[]): Promise<boolean> {
  try {
    const leads = fn(await readLocal());
    const body = leads.map((l) => JSON.stringify(l)).join("\n");
    await fs.writeFile(LOCAL_FILE, body ? `${body}\n` : "", "utf8");
    return true;
  } catch (err) {
    console.error("[leads] local rewrite failed", err);
    return false;
  }
}
