import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Admin session handling.
 *
 * Deliberately small: a single shared passphrase in ADMIN_PASSWORD, plus a
 * signed cookie proving it was entered. There is one operator — the owner —
 * so a full user table would be machinery without a purpose.
 *
 * The cookie carries an expiry and an HMAC over it, signed with ADMIN_SECRET,
 * so it cannot be forged or extended client-side.
 */

const COOKIE = "flocons_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

/** Constant-time compare that tolerates differing lengths. */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still burn a comparison so timing does not leak the length.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("hex");
}

export function createSessionValue() {
  const key = secret();
  if (!key) return null;
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${expires}.${nonce}`;
  return `${payload}.${sign(payload, key)}`;
}

export function isValidSessionValue(value: string | undefined) {
  const key = secret();
  if (!key || !value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [expiresRaw, nonce, mac] = parts;
  const payload = `${expiresRaw}.${nonce}`;
  if (!safeEqual(mac, sign(payload, key))) return false;

  const expires = Number(expiresRaw);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAuthenticated() {
  const jar = await cookies();
  return isValidSessionValue(jar.get(COOKIE)?.value);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE_SECONDS;
