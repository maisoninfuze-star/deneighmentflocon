import type { ReactNode } from "react";

/**
 * The real document shell lives in `app/[locale]/layout.tsx` — it needs the
 * resolved locale to set <html lang>. This root layout exists only to satisfy
 * Next's requirement that `app/layout.tsx` be present.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
