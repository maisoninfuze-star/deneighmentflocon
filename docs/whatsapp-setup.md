# WhatsApp owner alerts — setup

When configured, every new estimate and contact message sends an **instant
WhatsApp to the owner** (the number in `WHATSAPP_TO`). Until then the code
no-ops and logs a warning — the site works without it.

This uses the **official WhatsApp Business Cloud API** (free tier; Meta charges
a small per-message fee for business-initiated messages). Do **not** use
unofficial "auto-send" libraries — Meta bans numbers that use them.

## One-time setup (about 20–30 min)

1. **Meta Business account** — create one at business.facebook.com.
2. **Add WhatsApp** at developers.facebook.com → create an app (type *Business*)
   → add the **WhatsApp** product.
3. **Business phone number** — add a phone number for WhatsApp. It must be a
   number that is **not** currently active in the regular WhatsApp app. This
   becomes the *sender*. Copy its **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
4. **Permanent access token** — create a System User in Business Settings, give
   it the `whatsapp_business_messaging` permission, and generate a **permanent**
   token → `WHATSAPP_TOKEN`. (The temporary token in the dashboard expires in 24h
   and is only good for testing.)
5. **Owner's receiving number** → `WHATSAPP_TO` (digits + country code, e.g.
   `15148132297`). This is where the alerts land — the owner's normal WhatsApp.
6. **Message template** (required for the first message) — in WhatsApp Manager →
   *Message templates* → create a template:
   - **Name:** `new_lead`  (must match `WHATSAPP_TEMPLATE`)
   - **Category:** *Utility*
   - **Language:** French  (`WHATSAPP_TEMPLATE_LANG=fr`)
   - **Body** (copy exactly — 5 variables, in this order):

     ```
     🔔 Nouvelle {{1}}
     👤 {{2}}
     📍 {{3}}
     📞 {{4}}
     Réf : {{5}}
     ```

   - Sample values when prompted: `demande d'estimation`, `Marie Tremblay`,
     `Résidentiel · Laval · 800 pi²`, `(514) 555-0142`, `FL-8K3M2Q`.
   - Submit for review (usually approved within minutes to a day).

7. Put all values in `.env.local` (or your Vercel env vars) and redeploy.

## Testing without a template

Leave `WHATSAPP_TEMPLATE` blank and, from the owner's phone, send any WhatsApp
message **to the business number first**. That opens a 24-hour window in which
the code can deliver a plain-text alert. Good for a quick end-to-end check
before the template is approved.

## What the owner receives

> 🔔 Nouvelle demande d'estimation
> 👤 Marie Tremblay
> 📍 Résidentiel · Laval · 800 pi²
> 📞 (514) 555-0142
> Réf : FL-8K3M2Q

The customer's phone number is in the message, so the owner taps it to call or
message back. The lead is also saved to the dashboard and emailed — WhatsApp is
an extra channel, never the only record.
