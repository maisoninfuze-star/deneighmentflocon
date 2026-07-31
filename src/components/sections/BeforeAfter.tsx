"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Before / after, built as a plow pass rather than a slider.
 *
 * The handle is a gold blade. Snow to its right, cleared asphalt to its left.
 * The boundary is a ragged accumulation edge — not a straight cut — and a fine
 * spray of particles trails it, so dragging feels like pushing snow rather than
 * sliding a divider.
 *
 * Fully keyboard operable: it exposes a real slider role and responds to
 * arrows, Home and End.
 */
export function BeforeAfter() {
  const t = useTranslations("beforeAfter");
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(52);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, updateFromClientX]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 12 : 4;
    if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - step));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + step));
    else if (e.key === "Home") setPos(4);
    else if (e.key === "End") setPos(96);
    else return;
    e.preventDefault();
  };

  return (
    <section className="section relative overflow-hidden bg-navy-950">
      <div className="shell relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
          lead={t("body")}
          align="center"
        />

        <Reveal delay={0.12} className="mt-16">
          <div
            ref={containerRef}
            className={cn(
              "relative aspect-[16/10] w-full select-none overflow-hidden rounded-3xl",
              "border border-ice-300/12 shadow-(--shadow-lift)",
              dragging ? "cursor-grabbing" : "cursor-grab",
            )}
            onPointerDown={(e) => {
              setDragging(true);
              updateFromClientX(e.clientX);
            }}
          >
            {/* ================= AFTER (cleared) — the base layer ============ */}
            <DrivewayScene cleared />

            {/* ================= BEFORE (snow) — clipped to the right ======== */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
            >
              <DrivewayScene cleared={false} />
            </div>

            {/* ---- Ragged accumulation edge riding the boundary ---- */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-24"
              style={{ left: `calc(${pos}% - 3rem)` }}
            >
              <svg
                viewBox="0 0 100 400"
                preserveAspectRatio="none"
                className="size-full"
              >
                <path
                  d="M52 0
                     Q40 26 58 52 Q72 78 50 104 Q34 132 56 158
                     Q76 186 52 214 Q36 242 58 268 Q74 296 50 322
                     Q34 350 56 376 Q66 390 52 400
                     L100 400 L100 0 Z"
                  fill="#F4FAF8"
                />
                <path
                  d="M52 0
                     Q40 26 58 52 Q72 78 50 104 Q34 132 56 158
                     Q76 186 52 214 Q36 242 58 268 Q74 296 50 322
                     Q34 350 56 376 Q66 390 52 400"
                  fill="none"
                  stroke="#C4DDEC"
                  strokeWidth="3"
                  opacity="0.6"
                />
              </svg>
            </div>

            {/* ---- Spray thrown off the blade while dragging ---- */}
            {!reduced && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-40"
                style={{ left: `calc(${pos}% - 10rem)` }}
              >
                {SPRAY.map((s, i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      width: s.r,
                      height: s.r,
                    }}
                    animate={
                      dragging
                        ? { opacity: [0, 0.85, 0], x: [-4, -34], y: [0, -22] }
                        : { opacity: 0 }
                    }
                    transition={{
                      duration: 0.9 + s.d,
                      repeat: dragging ? Infinity : 0,
                      delay: s.d,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}

            {/* ================= THE BLADE HANDLE ================= */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={t("aria")}
              aria-valuemin={4}
              aria-valuemax={96}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={`${Math.round(pos)}% ${t("after")}`}
              onKeyDown={onKeyDown}
              className="absolute inset-y-0 z-10 -ml-6 w-12 cursor-ew-resize outline-none"
              style={{ left: `${pos}%` }}
            >
              {/* Shaft */}
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-linear-to-b from-transparent via-gold-500 to-transparent" />
              {/* Grip */}
              <motion.span
                className={cn(
                  "absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2",
                  "items-center justify-center rounded-full border border-gold-400/50",
                  "bg-navy-950/85 text-gold-400 backdrop-blur-xl",
                  "shadow-[0_8px_32px_-8px_rgba(246,189,11,0.7)]",
                )}
                animate={
                  reduced ? undefined : { scale: dragging ? 1.12 : 1 }
                }
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <MoveHorizontal className="size-5" strokeWidth={2} />
              </motion.span>
            </div>

            {/* ---- Labels ---- */}
            <span className="pointer-events-none absolute bottom-5 left-5 rounded-full border border-ice-300/18 bg-navy-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-snow backdrop-blur-xl">
              {t("after")}
            </span>
            <span className="pointer-events-none absolute bottom-5 right-5 rounded-full border border-navy-800/18 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy-900 backdrop-blur-xl">
              {t("before")}
            </span>

            {/* Hint, fades out once the user takes over */}
            <motion.span
              className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-navy-950/70 px-4 py-2 text-xs text-ice-300/80 backdrop-blur-xl"
              animate={{ opacity: dragging ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            >
              {t("hint")}
            </motion.span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Deterministic spray particles — no Math.random during render. */
const SPRAY = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 2654435761) % 1000;
  return {
    x: 62 + (seed % 30),
    y: 8 + ((seed * 7) % 84),
    r: 2 + ((seed * 3) % 4),
    d: ((seed * 11) % 60) / 100,
  };
});

/* ------------------------------------------------------------------ */

/**
 * The property itself. Same scene twice — once buried, once cleared — so the
 * only thing that changes across the boundary is the snow.
 */
function DrivewayScene({ cleared }: { cleared: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 625"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`ba-sky-${cleared}`} x1="0" y1="0" x2="0" y2="1">
          {cleared ? (
            <>
              <stop offset="0%" stopColor="#0F5C96" />
              <stop offset="55%" stopColor="#6BA3C4" />
              <stop offset="100%" stopColor="#C4DDEC" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#042343" />
              <stop offset="55%" stopColor="#053050" />
              <stop offset="100%" stopColor="#274354" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`ba-asphalt-${cleared}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B5566" />
          <stop offset="100%" stopColor="#1B2C38" />
        </linearGradient>
        <linearGradient id={`ba-win-${cleared}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDD6B" />
          <stop offset="100%" stopColor="#F6BD0B" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1000" height="625" fill={`url(#ba-sky-${cleared})`} />

      {/* Distant treeline */}
      <path
        d="M0 300 L40 250 L70 300 L110 240 L150 300 L190 258 L230 300 L280 244 L330 300
           L380 254 L430 300 L480 240 L530 300 L580 250 L630 300 L690 246 L740 300
           L790 256 L840 300 L890 242 L940 300 L980 258 L1000 300 L1000 340 L0 340 Z"
        fill={cleared ? "#0A4472" : "#042343"}
        opacity="0.9"
      />

      {/* House */}
      <g>
        <path d="M300 330 L500 190 L700 330 Z" fill={cleared ? "#053050" : "#04283F"} />
        <rect x="330" y="330" width="340" height="150" fill={cleared ? "#0A4472" : "#053050"} />
        {/* Roof snow — heavier in the "before" state */}
        <path
          d="M500 190 L700 330 Q660 316 620 324 Q570 306 530 316 Q512 214 500 190 Z"
          fill="#F4FAF8"
          opacity={cleared ? 0.55 : 1}
        />
        <path
          d="M500 190 L300 330 Q340 316 380 324 Q430 306 470 316 Q488 214 500 190 Z"
          fill="#EEF5FA"
          opacity={cleared ? 0.5 : 1}
        />
        {/* Windows */}
        <rect x="366" y="366" width="70" height="72" rx="4" fill={`url(#ba-win-${cleared})`} opacity={cleared ? 0.55 : 0.95} />
        <rect x="466" y="366" width="70" height="72" rx="4" fill="#A1C9E0" opacity="0.5" />
        <rect x="566" y="366" width="70" height="72" rx="4" fill={`url(#ba-win-${cleared})`} opacity={cleared ? 0.5 : 0.85} />
        {/* Garage */}
        <rect x="700" y="374" width="120" height="106" fill={cleared ? "#053050" : "#04283F"} />
        <rect x="716" y="396" width="88" height="84" rx="3" fill="#274354" />
      </g>

      {/* ---- The driveway ---- */}
      <path d="M330 480 L820 480 L940 625 L210 625 Z" fill={`url(#ba-asphalt-${cleared})`} />

      {cleared ? (
        <>
          {/* Tyre tracks on damp, freshly cleared asphalt */}
          <path d="M430 480 L400 625" stroke="#5A7688" strokeWidth="26" opacity="0.35" />
          <path d="M640 480 L720 625" stroke="#5A7688" strokeWidth="26" opacity="0.35" />
          {/* Wet sheen */}
          <path d="M330 480 L820 480 L940 625 L210 625 Z" fill="#A1C9E0" opacity="0.09" />
          {/* Neatly banked snow along both edges */}
          <path d="M330 480 Q290 462 254 486 Q222 508 210 625 L300 625 Q318 540 350 496 Z" fill="#F4FAF8" />
          <path d="M820 480 Q862 462 898 488 Q930 510 940 625 L852 625 Q834 540 800 496 Z" fill="#F4FAF8" />
        </>
      ) : (
        <>
          {/* Untouched accumulation swallowing the driveway */}
          <path
            d="M330 480 L820 480 L940 625 L210 625 Z"
            fill="#F4FAF8"
          />
          <path
            d="M210 625 Q340 578 470 596 Q600 566 730 592 Q840 574 940 625 Z"
            fill="#FFFFFF"
          />
          {/* Drift shadows so the mass reads as three-dimensional */}
          <path d="M300 560 Q420 536 540 552 Q660 532 780 550" stroke="#C4DDEC" strokeWidth="14" fill="none" opacity="0.55" />
          <path d="M256 600 Q400 578 544 592 Q688 572 832 590" stroke="#DDEBF4" strokeWidth="12" fill="none" opacity="0.7" />
        </>
      )}

      {/* Lawn / foreground snow, present in both states */}
      <path d="M0 500 Q100 484 200 494 L210 625 L0 625 Z" fill="#EEF5FA" />
      <path d="M1000 500 Q900 484 800 496 L940 625 L1000 625 Z" fill="#EEF5FA" />
    </svg>
  );
}
