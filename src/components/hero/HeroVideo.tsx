"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Phone, ArrowRight } from "lucide-react";

import { site } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Snowfall } from "@/components/Snowfall";

/**
 * Realistic hero.
 *
 * When a cinematic clip exists at `public/hero/hero-desktop.mp4`, the hero
 * becomes a tall scroll section whose video is scrubbed by scroll position —
 * the driveway clears as the visitor scrolls. Until then (the clip is optional
 * and generated separately), it renders a single-screen hero with a slow
 * parallax of the poster photo. Either way the headline and CTAs are identical.
 *
 * Video availability is probed with a HEAD request rather than trusting the
 * <video> error event, which does not fire reliably for a 404 source.
 */
const VIDEO_DESKTOP = "/hero/hero-desktop.mp4";
const VIDEO_MOBILE = "/hero/hero-mobile.mp4";
const POSTER_DESKTOP = "/hero/hero-poster.jpg";
const POSTER_MOBILE = "/hero/hero-poster-mobile.jpg";
const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroVideo() {
  const reduced = useReducedMotion();
  const [hasVideo, setHasVideo] = useState(false);
  // A dedicated 9:16 clip is served to phones; the 16:9 clip to everything else.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const video = isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP;
  const poster = isMobile ? POSTER_MOBILE : POSTER_DESKTOP;

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    fetch(video, { method: "HEAD" })
      .then((r) => {
        if (alive && r.ok) setHasVideo(true);
        else if (alive) setHasVideo(false);
      })
      .catch(() => {
        /* no clip yet — stay on the poster hero */
      });
    return () => {
      alive = false;
    };
  }, [reduced, video]);

  if (hasVideo && !reduced)
    return <ScrubHero key={video} video={video} poster={poster} />;
  return <PosterHero reduced={!!reduced} poster={poster} />;
}

/* ------------------------------------------------------------------ */
/* Poster hero — single screen, slow parallax                          */
/* ------------------------------------------------------------------ */

function PosterHero({
  reduced,
  poster,
}: {
  reduced: boolean;
  poster: string;
}) {
  const t = useTranslations("hero");
  const tc = useTranslations("cta");
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh items-center overflow-hidden bg-navy-950"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={reduced ? undefined : { scale, y }}
      >
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-navy-950/92 via-navy-950/55 to-transparent md:via-navy-950/38"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/8 to-navy-950/45"
      />

      {!reduced && (
        <div aria-hidden className="absolute inset-0 opacity-70">
          <Snowfall density={0.7} wind={0.28} />
        </div>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      <div className="shell relative py-32">
        <HeroCopy t={t} tc={tc} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scrub hero — tall section, video driven by scroll                   */
/* ------------------------------------------------------------------ */

function ScrubHero({ video, poster }: { video: string; poster: string }) {
  const t = useTranslations("hero");
  const tc = useTranslations("cta");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.5, 0.72], [1, 1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.72], [0, -70]);
  const scrollCue = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.42]);

  // Drive currentTime from scroll, smoothed so flicks don't stutter.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;

    let raf = 0;
    let target = scrollYProgress.get();
    let current = target;
    const unsub = scrollYProgress.on("change", (v) => {
      target = v;
    });

    const loop = () => {
      const d = video.duration;
      if (d && Number.isFinite(d)) {
        current += (target - current) * 0.1;
        video.currentTime = Math.min(current, 0.999) * d;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, [ready, scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative h-[260vh]">
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-navy-950">
        <video
          ref={videoRef}
          poster={poster}
          muted
          playsInline
          preload="auto"
          aria-hidden
          onLoadedMetadata={() => {
            videoRef.current?.pause();
            setReady(true);
          }}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>

        <motion.div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-navy-950/92 via-navy-950/55 to-transparent md:via-navy-950/40"
          style={{ opacity: scrimOpacity }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/10 to-navy-950/55"
        />

        <div aria-hidden className="absolute inset-0 opacity-70">
          <Snowfall density={0.7} wind={0.28} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2"
          style={{ opacity: copyOpacity, y: copyY }}
        >
          <div className="shell">
            <HeroCopy t={t} tc={tc} />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
          style={{ opacity: scrollCue }}
          aria-hidden
        >
          <span className="eyebrow text-ice-300/50">{t("scroll")}</span>
          <span className="relative h-11 w-px overflow-hidden bg-ice-300/18">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-gold-500"
              animate={{ y: ["-100%", "280%"] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: [0.65, 0, 0.35, 1],
              }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeroCopy({
  t,
  tc,
}: {
  t: ReturnType<typeof useTranslations<"hero">>;
  tc: ReturnType<typeof useTranslations<"cta">>;
}) {
  return (
    <div className="max-w-3xl">
      <motion.p
        className="eyebrow flex items-center gap-3 text-ice-300/80"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        <span className="h-px w-9 bg-gold-500" />
        {t("eyebrow")}
      </motion.p>

      <h1 className="mt-7 text-display-2xl">
        <motion.span
          className="block text-white drop-shadow-[0_2px_30px_rgba(1,18,31,0.6)]"
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.28, ease: EASE }}
        >
          {t("titleLine1")}
        </motion.span>
        <motion.span
          className="block text-gradient-gold"
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.44, ease: EASE }}
        >
          {t("titleLine2")}
        </motion.span>
      </h1>

      <motion.p
        className="mt-8 max-w-xl text-lead text-ice-100/85 drop-shadow-[0_1px_12px_rgba(1,18,31,0.7)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.66, ease: EASE }}
      >
        {t("subtitle")}
      </motion.p>

      <motion.div
        className="mt-11 flex flex-col gap-3.5 sm:flex-row"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.82, ease: EASE }}
      >
        <ButtonLink href="/estimate" variant="primary" size="xl">
          {tc("estimate")}
          <ArrowRight className="size-4 transition-transform duration-500 ease-(--ease-out-expo) group-hover/btn:translate-x-1" />
        </ButtonLink>
        <ButtonLink href={toTelHref(site.phoneRaw)} variant="glass" size="xl">
          <Phone className="size-4" />
          {tc("call")}
        </ButtonLink>
      </motion.div>

      <motion.p
        className="mt-8 flex items-center gap-2.5 text-sm text-ice-100/65"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-500/70" />
          <span className="relative inline-flex size-2 rounded-full bg-gold-500" />
        </span>
        {tc("available")}
      </motion.p>
    </div>
  );
}
