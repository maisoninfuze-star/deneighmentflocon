"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance. Elegant, slow, never bouncy.
 * Under reduced motion it renders the content plainly with no transform.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  blur = true,
  once = true,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  as?: "div" | "section" | "li" | "span";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <MotionTag
      className={cn("reveal-fallback", className)}
      initial={{
        opacity: 0,
        y,
        filter: blur ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggers direct children. Pair with <RevealItem>.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  const parent: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <motion.div
      className={cn("reveal-fallback", className)}
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: EASE },
  },
};

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={revealItem} className={cn("reveal-fallback", className)}>
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word headline reveal. Splits on spaces and keeps line breaks
 * intact so long headlines still wrap naturally.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;

  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <motion.span
            className="reveal-fallback inline-block"
            variants={{
              hidden: { y: "108%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 1.05, ease: EASE },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
