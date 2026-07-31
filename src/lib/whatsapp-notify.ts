import { site } from "@/lib/site";
import type { EstimateInput } from "@/lib/estimate-schema";

/**
 * Automatic WhatsApp notifications to the OWNER when an inquiry arrives.
 *
 * This uses the official WhatsApp Business Cloud API (Meta). Like Supabase and
 * Resend, it is optional: with no credentials every function no-ops with a
 * console warning, so the site builds and runs before the account exists.
 *
 * Why a "template" and not plain text:
 *   Meta only allows free-form WhatsApp messages inside a 24-hour window that
 *   opens when the recipient messages your business number first. A form
 *   submission does not open that window, so the first message must be a
 *   pre-approved *template*. You create the template once in Meta Business
 *   Manager (see docs/whatsapp-setup.md) and set its name in WHATSAPP_TEMPLATE.
 *
 * For quick local testing you can instead send plain text: leave
 * WHATSAPP_TEMPLATE unset and first send any WhatsApp message from the owner's
 * phone TO the business number to open the 24-hour window.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v21.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// Where the alert is delivered — the owner's personal WhatsApp. Digits only,
// with country code (e.g. 15148132297). Defaults to the business number.
const TO = (process.env.WHATSAPP_TO ?? site.whatsapp).replace(/\D/g, "");
const TEMPLATE = process.env.WHATSAPP_TEMPLATE;
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG ?? "fr";

export const isWhatsAppConfigured = Boolean(TOKEN && PHONE_NUMBER_ID);

const SERVICE_FR: Record<string, string> = {
  residential: "Résidentiel",
  commercial: "Commercial",
  emergency: "Urgence",
  seasonal: "Saisonnier",
};

/** Fired when a customer completes the estimate form. */
export async function notifyOwnerNewEstimate(
  data: EstimateInput,
  reference: string,
) {
  await notifyOwner({
    kind: "demande d'estimation",
    name: data.name,
    detail: `${SERVICE_FR[data.serviceType] ?? data.serviceType} · ${data.city}${data.tempo ? " · Tempo" : ""}`,
    phone: data.phone,
    reference,
  });
}

/** Fired when someone sends a message through the contact form. */
export async function notifyOwnerNewContact(msg: {
  name: string;
  phone: string;
}) {
  await notifyOwner({
    kind: "message",
    name: msg.name,
    detail: "Formulaire de contact",
    phone: msg.phone,
    reference: "—",
  });
}

/* ------------------------------------------------------------------ */

type Alert = {
  kind: string;
  name: string;
  detail: string;
  phone: string;
  reference: string;
};

async function notifyOwner(alert: Alert) {
  if (!isWhatsAppConfigured) {
    console.warn(
      "[whatsapp] not configured — set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable owner alerts",
    );
    return;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  // Template body params, in the fixed order documented in the setup guide:
  //   {{1}} kind · {{2}} name · {{3}} detail · {{4}} phone · {{5}} reference
  const body = TEMPLATE
    ? {
        messaging_product: "whatsapp",
        to: TO,
        type: "template",
        template: {
          name: TEMPLATE,
          language: { code: TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: alert.kind },
                { type: "text", text: alert.name },
                { type: "text", text: alert.detail },
                { type: "text", text: alert.phone },
                { type: "text", text: alert.reference },
              ],
            },
          ],
        },
      }
    : {
        // Plain-text fallback — only delivers inside an open 24h session.
        messaging_product: "whatsapp",
        to: TO,
        type: "text",
        text: {
          preview_url: false,
          body:
            `🔔 Nouvelle ${alert.kind}\n` +
            `👤 ${alert.name}\n` +
            `📍 ${alert.detail}\n` +
            `📞 ${alert.phone}\n` +
            `Réf: ${alert.reference}`,
        },
      };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Surface Meta's error so a bad template name / expired token is obvious in
    // the logs, but never throw — a saved lead must not fail on a notification.
    const detail = await res.text().catch(() => "");
    console.error(`[whatsapp] send failed (${res.status})`, detail);
  }
}
