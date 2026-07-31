import { Resend } from "resend";
import { site } from "@/lib/site";
import type { EstimateInput } from "@/lib/estimate-schema";

/**
 * Transactional email. Like Supabase, Resend is optional — if the key is
 * absent every function here no-ops rather than throwing, so the site works
 * before the client has an account.
 */

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`;
const ownerEmail = process.env.OWNER_EMAIL ?? site.email;

const resend = apiKey ? new Resend(apiKey) : null;

export const isEmailConfigured = Boolean(apiKey);

export async function sendEstimateEmails(
  data: EstimateInput,
  reference: string,
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping estimate emails");
    return;
  }

  const fr = data.locale === "fr";

  // 1 — Notify the owner.
  await resend.emails.send({
    from,
    to: ownerEmail,
    replyTo: data.email,
    subject: `${fr ? "Nouvelle demande" : "New request"} — ${data.name} (${reference})`,
    html: ownerHtml(data, reference),
  });

  // 2 — Confirm to the customer, in their language.
  await resend.emails.send({
    from,
    to: data.email,
    subject: fr
      ? `Votre demande d'estimation — ${reference}`
      : `Your estimate request — ${reference}`,
    html: customerHtml(data, reference),
  });
}

export async function sendContactEmail(values: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping contact email");
    return;
  }

  await resend.emails.send({
    from,
    to: ownerEmail,
    replyTo: values.email,
    subject: `Message — ${values.name}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;color:#053050">
        <h2 style="margin:0 0 16px">${esc(values.name)}</h2>
        <p style="margin:0 0 6px"><a href="mailto:${esc(values.email)}">${esc(values.email)}</a></p>
        <p style="margin:0 0 20px">${esc(values.phone)}</p>
        <div style="padding:16px;background:#F4FAF8;border-radius:12px;white-space:pre-wrap">${esc(values.message)}</div>
      </div>`,
  });
}

/* ------------------------------------------------------------------ */

/** Escapes user input before it goes into an HTML email body. */
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 16px 8px 0;color:#7A9897;font-size:13px;white-space:nowrap">${esc(label)}</td>
    <td style="padding:8px 0;color:#053050;font-size:15px;font-weight:600">${esc(value)}</td>
  </tr>`;
}

function ownerHtml(data: EstimateInput, reference: string) {
  const fr = data.locale === "fr";

  const extras = [
    data.walkways && (fr ? "Allées" : "Walkways"),
    data.garage && (fr ? "Porte de garage" : "Garage door"),
    data.stairs && (fr ? "Escaliers" : "Stairs"),
    data.sidewalk && (fr ? "Trottoir" : "Sidewalk"),
    data.deicing && (fr ? "Déglaçage" : "De-icing"),
  ].filter(Boolean) as string[];

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px">
    <div style="background:#053050;color:#F4FAF8;padding:28px 32px;border-radius:16px 16px 0 0">
      <p style="margin:0;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#F6BD0B">
        ${fr ? "Nouvelle demande d'estimation" : "New estimate request"}
      </p>
      <h1 style="margin:10px 0 0;font-size:26px">${esc(data.name)}</h1>
      <p style="margin:6px 0 0;color:#A1C9E0;font-size:14px">${esc(reference)}</p>
    </div>
    <div style="border:1px solid #DDEBF4;border-top:0;border-radius:0 0 16px 16px;padding:28px 32px">
      <table style="width:100%;border-collapse:collapse">
        ${row(fr ? "Téléphone" : "Phone", data.phone)}
        ${row(fr ? "Courriel" : "Email", data.email)}
        ${row(fr ? "Adresse" : "Address", `${data.address}, ${data.city}, ${data.postalCode}`)}
        ${row("Service", data.serviceType)}
        ${row(fr ? "Propriété" : "Property", data.propertyType)}
        ${row(fr ? "Véhicules" : "Vehicles", String(data.vehicles))}
        ${row(fr ? "Abri Tempo" : "Tempo shelter", data.tempo ? (fr ? "Oui" : "Yes") : (fr ? "Non" : "No"))}
        ${extras.length ? row(fr ? "À déneiger" : "To clear", extras.join(", ")) : ""}
        ${data.obstacles ? row("Obstacles", data.obstacles) : ""}
        ${data.notes ? row("Notes", data.notes) : ""}
      </table>
      ${
        data.photos.length
          ? `<div style="margin-top:24px">
              <p style="margin:0 0 10px;font-size:13px;color:#7A9897">${fr ? "Photos" : "Photos"} (${data.photos.length})</p>
              ${data.photos.map((p) => `<a href="${esc(p.url)}" style="display:block;color:#0F5C96;font-size:14px;margin-bottom:4px">${esc(p.name)}</a>`).join("")}
            </div>`
          : ""
      }
      <a href="tel:${esc(site.phoneRaw)}" style="display:inline-block;margin-top:26px;background:#F6BD0B;color:#01121F;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:600;font-size:15px">
        ${fr ? "Rappeler le client" : "Call the client"}
      </a>
    </div>
  </div>`;
}

function customerHtml(data: EstimateInput, reference: string) {
  const fr = data.locale === "fr";
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px">
    <div style="background:#053050;color:#F4FAF8;padding:32px;border-radius:16px 16px 0 0">
      <h1 style="margin:0;font-size:24px">${fr ? "Demande reçue" : "Request received"}</h1>
    </div>
    <div style="border:1px solid #DDEBF4;border-top:0;border-radius:0 0 16px 16px;padding:32px;color:#053050;line-height:1.65">
      <p style="margin:0 0 16px">${fr ? `Bonjour ${esc(data.name)},` : `Hi ${esc(data.name)},`}</p>
      <p style="margin:0 0 16px">
        ${
          fr
            ? "Merci pour votre demande. Nous l'examinons et nous vous revenons avec un prix ferme en moins de 24 heures, souvent bien avant."
            : "Thank you for your request. We're reviewing it and will come back to you with a firm price within 24 hours, usually much sooner."
        }
      </p>
      <p style="margin:0 0 24px">
        ${fr ? "Votre numéro de référence :" : "Your reference number:"}
        <strong style="color:#0F5C96">${esc(reference)}</strong>
      </p>
      <p style="margin:0 0 8px;font-size:14px;color:#7A9897">
        ${fr ? "Besoin de nous joindre plus vite ?" : "Need to reach us sooner?"}
      </p>
      <a href="tel:${esc(site.phoneRaw)}" style="color:#0F5C96;font-weight:600;text-decoration:none;font-size:18px">${esc(site.phone)}</a>
      <p style="margin:28px 0 0;font-size:13px;color:#7A9897">
        ${site.name} · ${site.address.locality}, ${site.address.regionFull}
      </p>
    </div>
  </div>`;
}
