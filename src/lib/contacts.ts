import { promises as fs } from "node:fs";
import path from "node:path";
import { getServiceSupabase, CONTACTS_TABLE } from "@/lib/supabase";

export type ContactStatus = "new" | "read" | "replied";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  created_at: string;
};

const LOCAL_FILE = path.join(process.cwd(), ".leads", "contacts.jsonl");

/**
 * Contact-form messages. Same Supabase-or-local-JSONL strategy as leads.
 *
 * The local file predates message ids and statuses, so both are derived on
 * read: the id from the created_at timestamp, the status defaulting to "new".
 */
export async function listContacts(): Promise<{
  contacts: ContactMessage[];
  source: "supabase" | "local";
}> {
  const supabase = getServiceSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from(CONTACTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("[contacts] supabase read failed", error);
      return { contacts: [], source: "supabase" };
    }
    return { contacts: (data ?? []) as ContactMessage[], source: "supabase" };
  }

  const contacts = await readLocal();
  return { contacts: contacts.slice().reverse(), source: "local" };
}

export async function updateContact(
  id: string,
  patch: Partial<Pick<ContactMessage, "status">>,
): Promise<boolean> {
  const supabase = getServiceSupabase();
  if (supabase) {
    const { error } = await supabase
      .from(CONTACTS_TABLE)
      .update(patch)
      .eq("id", id);
    if (error) {
      console.error("[contacts] supabase update failed", error);
      return false;
    }
    return true;
  }
  return rewriteLocal((rows) =>
    rows.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  );
}

export async function deleteContact(id: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  if (supabase) {
    const { error } = await supabase.from(CONTACTS_TABLE).delete().eq("id", id);
    if (error) {
      console.error("[contacts] supabase delete failed", error);
      return false;
    }
    return true;
  }
  return rewriteLocal((rows) => rows.filter((c) => c.id !== id));
}

/* ------------------------------------------------------------------ */

async function readLocal(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line, i) => {
        try {
          const row = JSON.parse(line) as Partial<ContactMessage> & {
            created_at: string;
          };
          return {
            id: row.id ?? `${row.created_at}-${i}`,
            name: row.name ?? "",
            email: row.email ?? "",
            phone: row.phone ?? "",
            message: row.message ?? "",
            status: (row.status as ContactStatus) ?? "new",
            created_at: row.created_at,
          } satisfies ContactMessage;
        } catch {
          return null;
        }
      })
      .filter((c): c is ContactMessage => c !== null);
  } catch {
    return [];
  }
}

async function rewriteLocal(
  fn: (rows: ContactMessage[]) => ContactMessage[],
): Promise<boolean> {
  try {
    const rows = fn(await readLocal());
    const body = rows.map((r) => JSON.stringify(r)).join("\n");
    await fs.writeFile(LOCAL_FILE, body ? `${body}\n` : "", "utf8");
    return true;
  } catch (err) {
    console.error("[contacts] local rewrite failed", err);
    return false;
  }
}
