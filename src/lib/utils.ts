import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** (514) 813-2297 → +15148132297 */
export function toTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? "1" : ""}${digits}`;
}

/** Formats 5148132297 → (514) 813-2297 as the user types. */
export function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Formats h7x1a1 → H7X 1A1 as the user types. */
export function formatPostal(value: string) {
  const c = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return c.length <= 3 ? c : `${c.slice(0, 3)} ${c.slice(3)}`;
}

/** Human-readable reference, e.g. FL-8K3M2Q. Shown to the customer. */
export function makeReference() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FL-${out}`;
}

export function bytesToSize(bytes: number) {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Driveway area in square feet, whichever unit the customer chose. */
export function toSquareFeet(
  length: number,
  width: number,
  unit: "feet" | "meters",
) {
  const factor = unit === "meters" ? 3.28084 : 1;
  return Math.round(length * factor * width * factor);
}
