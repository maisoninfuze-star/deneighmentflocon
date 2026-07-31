import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional at build time.
 *
 * The site has to build and run before the client has an account — so every
 * accessor here returns null when the environment isn't configured, and the
 * callers fall back to a durable local queue. Nothing throws at import time.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Browser client — subject to row level security. Used for photo uploads. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Server client with the service role key. Bypasses RLS — only ever import
 * this from route handlers and server actions, never from a client component.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const ESTIMATES_TABLE = "estimates";
export const CONTACTS_TABLE = "contact_messages";
export const PHOTOS_BUCKET = "estimate-photos";
