"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

/**
 * Counts up once, the first time it scrolls into view.
 * Renders the final value immediately under reduced motion.
 */
export function Counter({
  to,
  suffix = "",
  className,
  duration = 2,
}: {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (reduced || !inView) return;
    mv.set(to);
  }, [inView, to, mv, reduced]);

  useEffect(() => {
    if (reduced) return;
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring, reduced]);

  // Under reduced motion the final value is rendered directly — no state, no
  // effect, nothing to animate.
  const value = reduced ? to : display;

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("fr-CA")}
      {suffix}
    </span>
  );
}
