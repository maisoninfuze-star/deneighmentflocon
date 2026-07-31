"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Snowfall } from "@/components/Snowfall";
import { lenisRef } from "@/lib/lenis";

/**
 * Opening animation.
 *
 * A full-screen navy curtain reveals the real brand badge — it scales up out of
 * a blur while snow drifts and a gold line draws underneath — then lifts away
 * to uncover the hero. Plays once per browser session (sessionStorage), so it's
 * a first-impression moment, not a tax on every navigation.
 *
 * The overlay is rendered on the server too (initial `visible = true`) so the
 * hero never flashes before it; the client then either plays the intro (first
 * visit) or lifts it away immediately (returning visitor / reduced motion).
 */
const KEY = "flocons_intro_seen";
const EASE = [0.16, 1, 0.3, 1] as const;

export function Intro() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      // Private mode or storage disabled — just play it.
    }

    // Deciding whether to play is inherently a mount-time read of browser-only
    // state (sessionStorage, reduced-motion), so this setState-in-effect is the
    // intended pattern here rather than a cascading-render smell.
    if (seen || reduced) {
      setVisible(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    setPlay(true);
    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();

    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [reduced]);

  const onGone = () => {
    document.body.style.overflow = "";
    lenisRef.current?.start();
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence onExitComplete={onGone}>
      {visible && (
        <motion.div
          key="intro"
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-navy-950"
          initial={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduced ? 0.3 : 0.9, ease: EASE }}
        >
          {/* Atmosphere */}
          <div aria-hidden className="absolute inset-0 aurora opacity-70" />
          {play && (
            <div aria-hidden className="absolute inset-0 opacity-70">
              <Snowfall density={0.85} wind={0.22} interactive={false} />
            </div>
          )}
          <div aria-hidden className="absolute inset-0 grain" />

          {/* Cold-to-gold glow behind the mark */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(246,189,11,0.16) 0%, rgba(163,201,224,0.06) 38%, transparent 66%)",
            }}
          />

          <div className="relative flex flex-col items-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, filter: "blur(16px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image
                src="/brand/logo-full.png"
                alt="Déneigement Flocons"
                width={738}
                height={765}
                priority
                className="h-auto w-[min(64vw,20rem)] drop-shadow-[0_24px_70px_rgba(1,18,31,0.65)]"
              />
            </motion.div>

            {/* Gold loader line */}
            <div className="relative mt-9 h-px w-44 overflow-hidden bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gold-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.3, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
