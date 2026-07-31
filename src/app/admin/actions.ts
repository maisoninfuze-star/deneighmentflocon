"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAuthenticated, ADMIN_COOKIE } from "@/lib/admin-auth";
import {
  updateLead,
  deleteLead,
  type LeadStatus,
  LEAD_STATUSES,
} from "@/lib/leads";
import {
  updateContact,
  deleteContact,
  type ContactStatus,
} from "@/lib/contacts";
import { saveSettings } from "@/lib/settings";

/**
 * All admin mutations. Every one re-checks the session server-side — the page
 * guard is not enough on its own, since actions are their own endpoints.
 */

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("unauthorized");
  }
}

type Result = { ok: boolean; error?: string };

export async function setLeadStatus(
  reference: string,
  status: LeadStatus,
): Promise<Result> {
  await requireAuth();
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: "bad_status" };

  const ok = await updateLead(reference, { status });
  if (ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/leads");
  }
  return { ok };
}

export async function saveLeadNotes(
  reference: string,
  notes: string,
): Promise<Result> {
  await requireAuth();
  const ok = await updateLead(reference, {
    admin_notes: notes.slice(0, 4000) || null,
  });
  if (ok) revalidatePath("/admin/leads");
  return { ok };
}

export async function removeLead(reference: string): Promise<Result> {
  await requireAuth();
  const ok = await deleteLead(reference);
  if (ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/leads");
  }
  return { ok };
}

export async function setContactStatus(
  id: string,
  status: ContactStatus,
): Promise<Result> {
  await requireAuth();
  const ok = await updateContact(id, { status });
  if (ok) revalidatePath("/admin/messages");
  return { ok };
}

export async function removeContact(id: string): Promise<Result> {
  await requireAuth();
  const ok = await deleteContact(id);
  if (ok) revalidatePath("/admin/messages");
  return { ok };
}

export async function saveSiteSettings(input: unknown): Promise<Result> {
  await requireAuth();
  const res = await saveSettings(input);
  if (res.ok) {
    // The public site reads settings in the root locale layout, so revalidate
    // the whole tree — a phone or area change should show everywhere at once.
    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
  }
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function signOut() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
