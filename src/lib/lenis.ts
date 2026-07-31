import type Lenis from "lenis";

/**
 * Shared handle on the Lenis instance.
 *
 * Kept in a module rather than on `window` — Lenis ships its own `Window.lenis`
 * declaration for its CDN build, and augmenting it here fights those types for
 * no benefit.
 */
let instance: Lenis | null = null;

export const lenisRef = {
  get current() {
    return instance;
  },
  set(next: Lenis | null) {
    instance = next;
  },
};
