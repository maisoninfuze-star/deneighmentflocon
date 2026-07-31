"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Glass card with pointer-tracked light.
 *
 * Two things happen on hover: the card tilts a couple of degrees toward the
 * cursor, and a soft highlight follows the pointer across the surface — so the
 * glass reads as a real material catching a light source. Both are desktop-only
 * and both are disabled under reduced motion.
 */
export function GlassCard({
  children,
  className,
  tilt = true,
  spotlight = true,
  lift = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  spotlight?: boolean;
  lift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Normalised pointer position within the card, -0.5 → 0.5.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Raw pixel position, for the spotlight centre.
  const sx = useMotionValue(50);
  const sy = useMotionValue(50);

  const springCfg = { stiffness: 190, damping: 22, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), springCfg);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), springCfg);

  const background = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, rgba(238,245,250,0.14), transparent 62%)`,
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx - 0.5);
    py.set(ny - 0.5);
    sx.set(nx * 100);
    sy.set(ny * 100);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const enableTilt = tilt && !reduced;

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        enableTilt
          ? { rotateX, rotateY, transformPerspective: 1100 }
          : undefined
      }
      whileHover={lift && !reduced ? { y: -6 } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group/card sheen relative overflow-hidden rounded-2xl",
        "glass will-change-transform",
        "transition-shadow duration-600 ease-(--ease-out-expo)",
        "hover:shadow-(--shadow-lift)",
        className,
      )}
    >
      {spotlight && !reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{ background }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
