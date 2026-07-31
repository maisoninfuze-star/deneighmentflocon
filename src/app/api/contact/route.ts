import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { getServiceSupabase, CONTACTS_TABLE } from "@/lib/supabase";
import { sendContactEmail } from "@/lib/email";
import { notifyOwnerNewContact } from "@/lib/whatsapp-notify";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length === 10),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
  // Honeypot — accepted by the schema so a filled value doesn't 422 and
  // signal to a bot which field caught it. Dropped in the handler below.
  website: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const data = parsed.data;
  if (data.website) return NextResponse.json({ ok: true });

  const record = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    status: "new" as const,
    created_at: new Date().toISOString(),
  };

  const supabase = getServiceSupabase();
  if (supabase) {
    const { error } = await supabase.from(CONTACTS_TABLE).insert(record);
    if (error) {
      console.error("[contact] supabase insert failed", error);
      return NextResponse.json({ error: "storage_failed" }, { status: 503 });
    }
  } else {
    try {
      const dir = path.join(process.cwd(), ".leads");
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(
        path.join(dir, "contacts.jsonl"),
        `${JSON.stringify(record)}\n`,
        "utf8",
      );
    } catch (err) {
      console.error("[contact] local fallback write failed", err);
      return NextResponse.json({ error: "storage_failed" }, { status: 503 });
    }
  }

  // Best-effort notifications — a saved message must not fail on these.
  await Promise.allSettled([
    sendContactEmail(data).catch((err) =>
      console.error("[contact] email dispatch failed", err),
    ),
    notifyOwnerNewContact(data).catch((err) =>
      console.error("[contact] whatsapp dispatch failed", err),
    ),
  ]);

  return NextResponse.json({ ok: true });
}
