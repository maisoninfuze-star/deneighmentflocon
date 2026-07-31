"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Phone, ArrowRight } from "lucide-react";

import { site } from "@/lib/site";
import { toTelHref } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Snowfall } from "@/components/Snowfall";
import {
  Treeline,
  LuxuryHouse,
  PlowTruck,
  Neighbourhood,
  CommercialDistrict,
} from "./Scenery";

/**
 * The five-scene cinematic hero.
 *
 * One scroll container drives everything. The inner viewport is sticky, so the
 * scene stays put while ~3.2 screens of scroll advance a single 0→1 timeline:
 *
 *   0.00 – 0.15  Scene 1 · night, snowfall, the house, the headline
 *   0.15 – 0.40  Scene 2 · the truck enters and clears the driveway
 *   0.40 – 0.60  Scene 3 · the camera lifts, the neighbourhood opens up
 *   0.60 – 0.80  Scene 4 · the district turns commercial
 *   0.80 – 1.00  Scene 5 · the storm breaks, golden light, the call to action
 *
 * Under prefers-reduced-motion the whole thing collapses to a single static
 * screen with the headline and the two CTAs — no scroll hijack, no scrubbing.
 */
export function HeroCinematic() {
  const t = useTranslations("hero");
  const tc = useTranslations("cta");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Lenis already smooths the scroll itself, so the progress value is used
  // raw. Wrapping it in a spring here made the scene lag visibly behind the
  // scrollbar and doubled the per-frame work for no visual gain.
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* ---------------- Sky : the emotional through-line ---------------- */
  // Night blue → cold daylight → golden morning after the storm.
  const skyTop = useTransform(
    p,
    [0, 0.4, 0.62, 0.84, 1],
    ["#01121F", "#042343", "#0A4472", "#1B76BC", "#F6BD0B"],
  );
  const skyMid = useTransform(
    p,
    [0, 0.4, 0.62, 0.84, 1],
    ["#042343", "#053050", "#0F5C96", "#6BA3C4", "#FFCE2E"],
  );
  const skyBottom = useTransform(
    p,
    [0, 0.4, 0.62, 0.84, 1],
    ["#04283F", "#0A4472", "#6BA3C4", "#C4DDEC", "#FFDD6B"],
  );

  /* ---------------- Snowfall intensity ---------------- */
  // Heavy through the storm, thinning as the clouds open in scene 5.
  const snowOpacity = useTransform(p, [0, 0.55, 0.8, 0.95], [1, 1, 0.55, 0.06]);

  /* ---------------- Scene 1 : house + headline ---------------- */
  const s1Text = useTransform(p, [0, 0.1, 0.16], [1, 1, 0]);
  const s1TextY = useTransform(p, [0, 0.16], [0, -80]);
  const s1TextBlur = useTransform(p, [0.08, 0.16], [0, 12]);
  const s1Filter = useTransform(s1TextBlur, (v) => `blur(${v}px)`);

  // The ground plane pushes back and drops away as the camera climbs.
  // Starts near 1 — anything larger pushes the house past the right edge.
  const groundScale = useTransform(p, [0, 0.4, 0.58], [1.05, 1, 0.72]);
  const groundY = useTransform(p, [0, 0.4, 0.58], ["8%", "0%", "42%"]);
  const groundOpacity = useTransform(p, [0.46, 0.58], [1, 0]);

  /* ---------------- Scene 2 : the plow ---------------- */
  // Enters left, crosses the driveway, exits right.
  const truckX = useTransform(p, [0.15, 0.4], ["-42%", "128%"]);
  const truckOpacity = useTransform(p, [0.14, 0.18, 0.37, 0.42], [0, 1, 1, 0]);
  // Slight bounce as it works — the blade is loaded, the suspension moves.
  const truckY = useTransform(p, [0.15, 0.22, 0.29, 0.36, 0.4], [0, -5, 3, -4, 0]);

  // Snow on the driveway retreats exactly with the blade.
  const snowWidth = useTransform(p, [0.17, 0.38], ["100%", "0%"]);
  // The pile it pushes grows at the far end.
  const pileScale = useTransform(p, [0.2, 0.38], [0.2, 1]);
  const pileOpacity = useTransform(p, [0.2, 0.26], [0, 1]);
  // Tyre tracks appear behind it.
  const tracksOpacity = useTransform(p, [0.24, 0.36], [0, 0.55]);

  const s2Text = useTransform(p, [0.2, 0.26, 0.34, 0.4], [0, 1, 1, 0]);
  const s2Y = useTransform(p, [0.2, 0.4], [40, -40]);

  /* ---------------- Scene 3 : neighbourhood ---------------- */
  const s3Opacity = useTransform(p, [0.42, 0.5, 0.6, 0.66], [0, 1, 1, 0]);
  const s3Scale = useTransform(p, [0.42, 0.66], [1.28, 0.92]);
  const s3Y = useTransform(p, [0.42, 0.66], ["22%", "-14%"]);
  const s3Text = useTransform(p, [0.45, 0.51, 0.58, 0.63], [0, 1, 1, 0]);
  // Copy drifts in pixels while the scenery behind it moves in percentages.
  const s3TextY = useTransform(p, [0.45, 0.63], [40, -40]);

  /* ---------------- Scene 4 : commercial ---------------- */
  const s4Opacity = useTransform(p, [0.62, 0.7, 0.8, 0.87], [0, 1, 1, 0]);
  const s4Scale = useTransform(p, [0.62, 0.87], [1.3, 0.94]);
  const s4Y = useTransform(p, [0.62, 0.87], ["26%", "-10%"]);
  const s4Text = useTransform(p, [0.65, 0.71, 0.78, 0.83], [0, 1, 1, 0]);
  const s4TextY = useTransform(p, [0.65, 0.83], [40, -40]);

  /* ---------------- Scene 5 : the break in the storm ---------------- */
  const sunOpacity = useTransform(p, [0.78, 0.92], [0, 1]);
  const sunScale = useTransform(p, [0.78, 1], [0.4, 1.15]);
  const sunY = useTransform(p, [0.78, 1], ["36%", "6%"]);
  const s5Text = useTransform(p, [0.86, 0.95], [0, 1]);
  const s5Y = useTransform(p, [0.86, 1], [50, 0]);

  const scrollHint = useTransform(p, [0, 0.06], [1, 0]);

  // Composed here rather than inline in JSX — it must run before the
  // reduced-motion early return so hook order stays stable across renders.
  const skyGradient = useTransform(
    [skyTop, skyMid, skyBottom],
    ([a, b, c]: string[]) =>
      `linear-gradient(to bottom, ${a} 0%, ${b} 52%, ${c} 100%)`,
  );

  /* ---------------- Reduced motion : one calm static screen ------------ */
  if (reduced) {
    return (
      <section className="relative flex min-h-dvh items-center overflow-hidden bg-navy-950">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-navy-950 via-navy-900 to-navy-800"
        />
        <div aria-hidden className="absolute inset-0 aurora opacity-70" />
        <div className="shell relative py-32">
          <HeroCopy t={t} tc={tc} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="relative h-[420vh]"
      aria-label={`${t("titleLine1")} ${t("titleLine2")}`}
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        {/* ============ SKY ============ */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ background: skyGradient }}
        />

        {/* Cold light pooling at the horizon */}
        <div aria-hidden className="absolute inset-0 aurora opacity-55" />

        {/* ============ SCENE 5 · sun ============ */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-0 -z-0 aspect-square w-[86vw] max-w-4xl -translate-x-1/2 rounded-full"
          style={{
            opacity: sunOpacity,
            scale: sunScale,
            y: sunY,
            background:
              "radial-gradient(circle, rgba(255,221,107,0.95) 0%, rgba(246,189,11,0.55) 32%, rgba(246,189,11,0) 68%)",
          }}
        />

        {/* ============ SCENE 4 · commercial district ============ */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex items-end justify-center"
          style={{ opacity: s4Opacity, scale: s4Scale, y: s4Y }}
        >
          <CommercialDistrict className="h-[62vh] w-[140%] max-w-none md:w-[112%]" />
        </motion.div>

        {/* ============ SCENE 3 · neighbourhood ============ */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex items-end justify-center"
          style={{ opacity: s3Opacity, scale: s3Scale, y: s3Y }}
        >
          <Neighbourhood className="h-[46vh] w-[150%] max-w-none md:w-[118%]" />
        </motion.div>

        {/* ============ SCENES 1–2 · the property ============ */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ scale: groundScale, y: groundY, opacity: groundOpacity }}
        >
          {/* Distant treeline */}
          <Treeline className="absolute inset-x-0 bottom-[27vh] h-[11vh] w-full opacity-35" />

          {/* The house — held to the right so the copy owns the left third */}
          <div className="absolute bottom-[22vh] right-[-8%] md:right-[4%]">
            <LuxuryHouse className="h-[30vh] w-auto max-w-none drop-shadow-[0_30px_60px_rgba(1,18,31,0.6)] md:h-[36vh]" />
          </div>

          {/* ---- The ground ----
              A continuous snowfield across the base of the frame. The driveway
              is a trapezoid cut into it: one clip on the wrapper, shared by the
              asphalt, the tracks and the retreating snow, so all three align. */}

          {/* Snowfield the property sits on, with drift contours so the mass
              reads as three-dimensional rather than as a flat dome */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[26vh] overflow-hidden"
            style={{ clipPath: "ellipse(82% 100% at 50% 100%)" }}
          >
            <div className="absolute inset-0 bg-linear-to-b from-ice-300 via-snow to-white" />
            <svg
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
            >
              <path
                d="M0 96 Q240 66 480 84 Q760 58 1000 80 Q1220 62 1440 86"
                fill="none"
                stroke="#A1C9E0"
                strokeWidth="12"
                opacity="0.34"
              />
              <path
                d="M0 158 Q280 132 560 148 Q840 122 1120 144 Q1290 132 1440 150"
                fill="none"
                stroke="#C4DDEC"
                strokeWidth="10"
                opacity="0.4"
              />
            </svg>
          </div>

          <div
            className="absolute bottom-0 left-1/2 h-[24vh] w-[74%] -translate-x-1/2 overflow-hidden"
            style={{ clipPath: "polygon(31% 0, 69% 0, 100% 100%, 0 100%)" }}
          >
            {/* Fresh asphalt underneath */}
            <div className="absolute inset-0 bg-linear-to-b from-[#2E4453] via-[#22333F] to-navy-950" />
            {/* Damp sheen on newly exposed pavement */}
            <div className="absolute inset-0 bg-linear-to-t from-ice-400/12 to-transparent" />

            {/* Tyre tracks left behind */}
            <motion.div className="absolute inset-0" style={{ opacity: tracksOpacity }}>
              <div className="absolute inset-y-0 left-[36%] w-[5%] bg-linear-to-b from-transparent to-ice-200/35" />
              <div className="absolute inset-y-0 left-[59%] w-[5%] bg-linear-to-b from-transparent to-ice-200/35" />
            </motion.div>

            {/* Snow still covering it — the edge retreats with the blade */}
            <motion.div
              className="absolute inset-y-0 right-0 bg-linear-to-b from-ice-200 via-snow to-white"
              style={{ width: snowWidth }}
            >
              {/* Soft shoulder where the blade is cutting */}
              <div className="absolute inset-y-0 -left-8 w-8 bg-linear-to-r from-transparent to-white" />
            </motion.div>
          </div>

          {/* Banks flanking the pass, so the driveway edges aren't bare geometry */}
          <div
            aria-hidden
            className="absolute bottom-0 left-[6%] h-[13vh] w-[26%] rounded-[100%_100%_0_0/160%_160%_0_0] bg-linear-to-b from-white to-ice-200"
          />
          <div
            aria-hidden
            className="absolute bottom-0 right-[6%] h-[13vh] w-[26%] rounded-[100%_100%_0_0/160%_160%_0_0] bg-linear-to-b from-white to-ice-200"
          />

          {/* The pile pushed off the far end of the pass */}
          <motion.div
            className="absolute bottom-[1vh] left-[13%] h-[15vh] w-[19%] rounded-[100%_100%_20%_20%/170%_170%_10%_10%] bg-linear-to-b from-white via-snow to-ice-300 drop-shadow-[0_-6px_18px_rgba(163,201,224,0.4)]"
            style={{ scale: pileScale, opacity: pileOpacity, originY: 1 }}
          />

          {/* ---- The truck ---- */}
          <motion.div
            className="absolute bottom-[13%] left-0 w-[46vw] max-w-[620px] min-w-[300px]"
            style={{ x: truckX, y: truckY, opacity: truckOpacity }}
          >
            <PlowTruck className="h-auto w-full drop-shadow-[0_24px_40px_rgba(1,18,31,0.6)]" />
          </motion.div>
        </motion.div>

        {/* ============ ATMOSPHERE ============ */}
        <motion.div className="absolute inset-0" style={{ opacity: snowOpacity }}>
          <Snowfall density={1.15} wind={0.36} />
        </motion.div>

        {/* Ground fog — light enough that the snow still reads as snow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] bg-linear-to-t from-navy-950/75 to-transparent"
        />
        {/* Scrim under the copy — kept to the upper-left so it never washes
            over the driveway. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full bg-linear-to-r from-navy-950/80 via-navy-950/25 to-transparent md:w-[56%]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

        {/* ============ COPY ============ */}
        <div className="pointer-events-none absolute inset-0">
          {/* Scene 1 */}
          <motion.div
            className="shell absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{ opacity: s1Text, y: s1TextY, filter: s1Filter }}
          >
            <div className="pointer-events-auto">
              <HeroCopy t={t} tc={tc} />
            </div>
          </motion.div>

          {/* Scene 2 */}
          <SceneCopy
            opacity={s2Text}
            y={s2Y}
            eyebrow={t("scene2.eyebrow")}
            title={t("scene2.title")}
            accent={t("scene2.titleAccent")}
            body={t("scene2.body")}
          />

          {/* Scene 3 */}
          <SceneCopy
            opacity={s3Text}
            y={s3TextY}
            eyebrow={t("scene3.eyebrow")}
            title={t("scene3.title")}
            accent={t("scene3.titleAccent")}
            body={t("scene3.body")}
          />

          {/* Scene 4 */}
          <SceneCopy
            opacity={s4Text}
            y={s4TextY}
            eyebrow={t("scene4.eyebrow")}
            title={t("scene4.title")}
            accent={t("scene4.titleAccent")}
            body={t("scene4.body")}
          />

          {/* Scene 5 — the payoff */}
          <motion.div
            className="shell absolute inset-x-0 top-1/2 -translate-y-1/2 text-center"
            style={{ opacity: s5Text, y: s5Y }}
          >
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <h2 className="text-display-xl text-navy-950">
                {t("scene5.title")}{" "}
                <span className="block text-white drop-shadow-[0_2px_20px_rgba(1,18,31,0.35)]">
                  {t("scene5.titleAccent")}
                </span>
              </h2>
              <p className="mx-auto mt-8 max-w-xl text-lead text-navy-900/80">
                {t("scene5.body")}
              </p>
              <div className="mt-11 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                <ButtonLink href="/estimate" variant="navy" size="xl">
                  {tc("estimate")}
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink
                  href={toTelHref(site.phoneRaw)}
                  size="xl"
                  className="border-navy-900/25 bg-navy-950/8 text-navy-950 hover:bg-navy-950/14"
                >
                  <Phone className="size-4" />
                  {site.phone}
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
          style={{ opacity: scrollHint }}
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
    <div className="max-w-4xl">
      <motion.p
        className="eyebrow flex items-center gap-3 text-ice-400/75"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="h-px w-9 bg-gold-500" />
        {t("eyebrow")}
      </motion.p>

      <h1 className="mt-7 text-display-2xl">
        <motion.span
          className="block text-gradient-ice"
          initial={{ opacity: 0, y: 44, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.3, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("titleLine1")}
        </motion.span>
        <motion.span
          className="block text-gradient-gold"
          initial={{ opacity: 0, y: 44, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.3, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
        >
          {t("titleLine2")}
        </motion.span>
      </h1>

      <motion.p
        className="mt-9 max-w-xl text-lead text-ice-300/72"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.66, ease: [0.16, 1, 0.3, 1] }}
      >
        {t("subtitle")}
      </motion.p>

      <motion.div
        className="mt-12 flex flex-col gap-3.5 sm:flex-row"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
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
        className="mt-8 flex items-center gap-2.5 text-sm text-ice-300/50"
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

function SceneCopy({
  opacity,
  y,
  eyebrow,
  title,
  accent,
  body,
}: {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
}) {
  return (
    <motion.div
      className="shell absolute inset-x-0 top-1/2 -translate-y-1/2"
      style={{ opacity, y }}
    >
      <div className="max-w-2xl">
        <p className="eyebrow flex items-center gap-3 text-gold-500">
          <span className="h-px w-9 bg-gold-500" />
          {eyebrow}
        </p>
        <h2 className="mt-6 text-display-lg text-snow">
          {title}{" "}
          <span className="text-gradient-gold">{accent}</span>
        </h2>
        <p className="mt-7 max-w-lg text-lead text-ice-300/70">{body}</p>
      </div>
    </motion.div>
  );
}

