import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

import { estimateSchema } from "@/lib/estimate-schema";
import { getServiceSupabase, ESTIMATES_TABLE } from "@/lib/supabase";
import { makeReference } from "@/lib/utils";
import { sendEstimateEmails } from "@/lib/email";
import { notifyOwnerNewEstimate } from "@/lib/whatsapp-notify";

/**
 * Saves an estimate request.
 *
 * The brief is explicit that the request must survive even if the customer
 * never opens WhatsApp — so persistence happens first and the response only
 * succeeds once the lead is durably stored. Email is best-effort and never
 * fails the request; WhatsApp is composed client-side after this returns.
 *
 * If Supabase isn't configured yet the lead is appended to a local JSONL file
 * so nothing is lost during development.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = estimateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot: a filled hidden field means a bot. Return 200 so it can't probe.
  if (data.website) {
    return NextResponse.json({ ok: true, reference: makeReference() });
  }

  const reference = makeReference();

  const record = {
    reference,
    status: "new" as const,
    locale: data.locale,
    service_type: data.serviceType,
    property_type: data.propertyType,
    vehicles: data.vehicles,
    tempo: data.tempo,
    walkways: data.walkways,
    garage: data.garage,
    stairs: data.stairs,
    sidewalk: data.sidewalk,
    deicing: data.deicing,
    obstacles: data.obstacles || null,
    notes: data.notes || null,
    photos: data.photos,
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    postal_code: data.postalCode.toUpperCase(),
    consent: data.consent,
    created_at: new Date().toISOString(),
  };

  const supabase = getServiceSupabase();

  if (supabase) {
    const { error } = await supabase.from(ESTIMATES_TABLE).insert(record);
    if (error) {
      console.error("[estimate] supabase insert failed", error);
      return NextResponse.json({ error: "storage_failed" }, { status: 503 });
    }
  } else {
    // No database configured — persist locally so the lead still survives.
    try {
      const dir = path.join(process.cwd(), ".leads");
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(
        path.join(dir, "estimates.jsonl"),
        `${JSON.stringify(record)}\n`,
        "utf8",
      );
      console.warn(
        "[estimate] Supabase not configured — lead written to .leads/estimates.jsonl",
      );
    } catch (err) {
      console.error("[estimate] local fallback write failed", err);
      return NextResponse.json({ error: "storage_failed" }, { status: 503 });
    }
  }

  // Best-effort notifications, fired together. Neither a mail nor a WhatsApp
  // failure may lose a lead that is already saved above.
  await Promise.allSettled([
    sendEstimateEmails(data, reference).catch((err) =>
      console.error("[estimate] email dispatch failed", err),
    ),
    notifyOwnerNewEstimate(data, reference).catch((err) =>
      console.error("[estimate] whatsapp dispatch failed", err),
    ),
  ]);

  return NextResponse.json({ ok: true, reference });
}
