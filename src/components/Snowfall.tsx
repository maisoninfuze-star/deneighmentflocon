"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Flake = {
  x: number;
  y: number;
  r: number;
  /** 0 = far background, 1 = close foreground. Drives size, blur and speed. */
  depth: number;
  vy: number;
  vx: number;
  /** Phase offset so flakes don't sway in unison. */
  phase: number;
  swayAmp: number;
  opacity: number;
};

/**
 * Atmospheric snowfall on a single canvas.
 *
 * Performance notes — this runs behind the entire site, so it has to be cheap:
 *  · one canvas, one RAF loop, no per-flake DOM
 *  · DPR capped at 2 (retina beyond that buys nothing at this blur level)
 *  · density scales with viewport area and halves on coarse pointers
 *  · loop fully stops when the tab is hidden or the canvas scrolls out of view
 *  · disabled outright under prefers-reduced-motion
 */
export function Snowfall({
  density = 1,
  className,
  wind = 0.32,
  interactive = true,
}: {
  density?: number;
  className?: string;
  wind?: number;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let flakes: Flake[] = [];
    let raf = 0;
    let running = true;

    // Pointer parallax — the whole field drifts gently toward the cursor.
    let pointerX = 0;
    let targetX = 0;

    const makeFlake = (seedY?: number): Flake => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: seedY ?? Math.random() * height,
        r: 0.6 + depth * 2.6,
        depth,
        vy: 12 + depth * 46,
        vx: (Math.random() - 0.5) * 8,
        phase: Math.random() * Math.PI * 2,
        swayAmp: 6 + depth * 20,
        opacity: 0.12 + depth * 0.62,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~1 flake per 9,000px² at density 1, halved on touch devices.
      const base = (width * height) / 9000;
      const count = Math.round(
        Math.min(base * density * (coarse ? 0.5 : 1), coarse ? 90 : 260),
      );
      flakes = Array.from({ length: count }, () => makeFlake());
    };

    let last = performance.now();

    const draw = (now: number) => {
      if (!running) return;
      // Clamp dt so a backgrounded tab doesn't teleport every flake.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, width, height);

      pointerX += (targetX - pointerX) * 0.035;

      for (const f of flakes) {
        f.phase += dt * (0.5 + f.depth * 0.8);
        f.y += f.vy * dt;
        f.x += (f.vx + wind * f.vy) * dt + Math.sin(f.phase) * f.swayAmp * dt;

        // Recycle off the bottom / sides rather than allocating new objects.
        if (f.y - f.r > height) {
          f.y = -f.r * 2;
          f.x = Math.random() * width;
        }
        if (f.x - f.r > width) f.x = -f.r;
        else if (f.x + f.r < 0) f.x = width + f.r;

        const px = f.x + pointerX * (0.25 + f.depth * 0.75);

        ctx.beginPath();
        ctx.arc(px, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(238, 245, 250, ${f.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive || coarse) return;
      targetX = (e.clientX / window.innerWidth - 0.5) * 46;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    // Only animate while the canvas is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    resize();
    document.addEventListener("visibilitychange", onVisibility);
    if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [density, wind, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
