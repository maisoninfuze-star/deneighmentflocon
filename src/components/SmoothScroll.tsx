"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenisRef } from "@/lib/lenis";

/**
 * Lenis drives the page. GSAP's ScrollTrigger is synced to it so scrubbed
 * timelines stay frame-accurate instead of fighting native scroll.
 * Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      // Slow, weighted decay — the "cinematic" feel comes from this curve.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    // Expose for anchor links and the mobile menu's scroll lock.
    lenisRef.set(lenis);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      lenisRef.set(null);
    };
  }, []);

  return null;
}
