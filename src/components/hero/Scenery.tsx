/**
 * Hero scenery, drawn as vector art.
 *
 * The logo is a bold flat-vector illustration with heavy outlines, so the hero
 * is built the same way rather than with photography — the scene and the mark
 * read as one visual language. Every layer is a plain SVG so it scales to any
 * viewport, weighs almost nothing, and animates on the compositor.
 */

/* ------------------------------------------------------------------ */
/* Far treeline — the horizon behind everything                        */
/* ------------------------------------------------------------------ */

export function Treeline({ className }: { className?: string }) {
  // Deterministic pseudo-random so server and client render identically.
  const trees = Array.from({ length: 34 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    return {
      x: (i / 34) * 1440 + rnd * 26,
      h: 46 + rnd * 78,
      w: 20 + rnd * 16,
    };
  });

  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      {trees.map((t, i) => (
        <path
          key={i}
          d={`M${t.x} 220 L${t.x} ${220 - t.h * 0.22}
              L${t.x - t.w / 2} ${220 - t.h * 0.3}
              L${t.x} ${220 - t.h}
              L${t.x + t.w / 2} ${220 - t.h * 0.3}
              L${t.x} ${220 - t.h * 0.22} Z`}
          fill="#042343"
          opacity={0.85}
        />
      ))}
      {/* Snow line settled on the treetops */}
      {trees.map((t, i) => (
        <path
          key={`s-${i}`}
          d={`M${t.x - t.w * 0.22} ${220 - t.h * 0.62}
              L${t.x} ${220 - t.h}
              L${t.x + t.w * 0.22} ${220 - t.h * 0.62}
              Q${t.x} ${220 - t.h * 0.72} ${t.x - t.w * 0.22} ${220 - t.h * 0.62} Z`}
          fill="#C4DDEC"
          opacity={0.32}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The luxury home — modern Scandinavian, gabled, warm windows         */
/* ------------------------------------------------------------------ */

export function LuxuryHouse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 420" className={className} aria-hidden>
      <defs>
        <linearGradient id="h-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDD6B" />
          <stop offset="100%" stopColor="#F6BD0B" />
        </linearGradient>
        <linearGradient id="h-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A1C9E0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6BA3C4" stopOpacity="0.25" />
        </linearGradient>
        <filter id="h-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="11" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* --- Left wing (flat roof, glass) --- */}
      <rect x="30" y="228" width="196" height="150" fill="#04283F" />
      <rect x="30" y="218" width="196" height="14" rx="3" fill="#053050" />
      {/* Snow on the flat roof */}
      <path
        d="M26 218 Q60 206 100 212 Q140 204 180 210 Q210 205 230 216 L230 232 L26 232 Z"
        fill="#F4FAF8"
      />
      {/* Floor-to-ceiling glazing */}
      <rect x="52" y="256" width="66" height="106" rx="3" fill="url(#h-glass)" />
      <rect x="136" y="256" width="66" height="106" rx="3" fill="url(#h-window)" opacity="0.92" filter="url(#h-glow)" />

      {/* --- Main gable --- */}
      <path d="M226 244 L392 108 L558 244 L558 380 L226 380 Z" fill="#053050" />
      {/* Roof planes */}
      <path d="M392 100 L572 248 L558 248 L392 118 Z" fill="#042343" />
      <path d="M392 100 L212 248 L226 248 L392 118 Z" fill="#04283F" />
      {/* Snow on the pitched roof — a band that thickens toward the eaves,
          the way accumulation actually settles, with a lip drooping over the
          edge. Drawn as two parallel bands rather than filled triangles, which
          would meet at the ridge and read as a tent. */}
      <path d="M392 100 L574 250 L540 250 L392 138 Z" fill="#F4FAF8" />
      <path d="M392 100 L210 250 L244 250 L392 138 Z" fill="#EEF5FA" />
      {/* Drooping lip along each eave */}
      <path
        d="M540 250 L574 250 Q580 262 566 264 Q550 266 544 256 Z"
        fill="#F4FAF8"
      />
      <path
        d="M210 250 L244 250 Q238 262 224 264 Q210 264 206 254 Z"
        fill="#EEF5FA"
      />
      {/* Cap settled on the ridge */}
      <ellipse cx="392" cy="106" rx="17" ry="8" fill="#FFFFFF" />
      {/* Eaves overhang shadow */}
      <path d="M212 248 L572 248 L566 258 L218 258 Z" fill="#01121F" opacity="0.4" />

      {/* Warm interior — the reason this reads as "home" and not "building" */}
      <rect x="264" y="278" width="82" height="102" rx="4" fill="url(#h-window)" filter="url(#h-glow)" />
      <rect x="366" y="278" width="52" height="60" rx="4" fill="url(#h-glass)" />
      <rect x="438" y="278" width="82" height="102" rx="4" fill="url(#h-window)" opacity="0.82" filter="url(#h-glow)" />
      {/* Mullions */}
      <line x1="305" y1="278" x2="305" y2="380" stroke="#053050" strokeWidth="4" />
      <line x1="479" y1="278" x2="479" y2="380" stroke="#053050" strokeWidth="4" />

      {/* Front door + porch light */}
      <rect x="366" y="344" width="52" height="36" rx="3" fill="#01121F" />
      <circle cx="430" cy="290" r="4" fill="#FFDD6B" filter="url(#h-glow)" />

      {/* --- Garage (right) --- */}
      <rect x="558" y="268" width="72" height="112" fill="#04283F" />
      <path d="M552 268 Q580 256 604 262 Q622 258 636 266 L636 280 L552 280 Z" fill="#F4FAF8" />
      <rect x="572" y="300" width="46" height="80" rx="3" fill="#053050" />
      {/* Garage door ribs */}
      {[314, 330, 346, 362].map((y) => (
        <line key={y} x1="572" y1={y} x2="618" y2={y} stroke="#042343" strokeWidth="2.5" />
      ))}

      {/* Snow banked against the foundation */}
      <path
        d="M0 380 Q80 362 160 372 Q240 356 320 368 Q400 354 480 366 Q560 356 640 370 L640 420 L0 420 Z"
        fill="#F4FAF8"
      />
      <path
        d="M0 392 Q120 378 240 386 Q360 374 480 384 Q560 378 640 388 L640 420 L0 420 Z"
        fill="#FFFFFF"
        opacity="0.55"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The plow truck — white body, blade in the exact logo gold           */
/* ------------------------------------------------------------------ */

export function PlowTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 260" className={className} aria-hidden>
      <defs>
        <linearGradient id="t-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="62%" stopColor="#F4FAF8" />
          <stop offset="100%" stopColor="#C4DDEC" />
        </linearGradient>
        <linearGradient id="t-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCE2E" />
          <stop offset="55%" stopColor="#F6BD0B" />
          <stop offset="100%" stopColor="#C28F06" />
        </linearGradient>
        <linearGradient id="t-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A1C9E0" />
          <stop offset="100%" stopColor="#0A4472" />
        </linearGradient>
        <filter id="t-lamp" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="268" cy="238" rx="176" ry="13" fill="#01121F" opacity="0.42" />

      {/* ---- PLOW BLADE (leads the truck, left side) ---- */}
      <g>
        {/* Push frame */}
        <path d="M150 196 L186 196 L182 172 L154 172 Z" fill="#274354" />
        {/* Blade face — concave, the signature shape from the logo */}
        <path
          d="M60 92 Q34 132 40 200 L44 214 L150 214 L150 196 Q120 186 112 150 Q106 112 118 88 Z"
          fill="url(#t-blade)"
          stroke="#01121F"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Ribs */}
        <path d="M72 104 Q52 146 58 202" stroke="#C28F06" strokeWidth="3.5" fill="none" opacity="0.75" />
        <path d="M94 98 Q76 142 82 204" stroke="#C28F06" strokeWidth="3.5" fill="none" opacity="0.6" />
        {/* Cutting edge */}
        <path d="M40 202 L150 202 L150 216 L42 216 Z" fill="#274354" stroke="#01121F" strokeWidth="3" />
        {/* Snow curling off the blade */}
        <path
          d="M58 96 Q42 74 20 70 Q40 58 62 70 Q54 52 34 42 Q66 42 82 68 Q76 46 62 30 Q98 46 104 86 Z"
          fill="#FFFFFF"
          opacity="0.92"
        />
      </g>

      {/* ---- TRUCK BODY ---- */}
      {/* Cargo bed */}
      <path
        d="M300 118 L474 118 L474 194 L300 194 Z"
        fill="url(#t-body)"
        stroke="#01121F"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Bed rails */}
      <line x1="300" y1="132" x2="474" y2="132" stroke="#C4DDEC" strokeWidth="3" />

      {/* Cab */}
      <path
        d="M186 194 L186 128 Q186 118 196 116 L232 108 L252 62 Q256 52 268 52 L300 52 L300 194 Z"
        fill="url(#t-body)"
        stroke="#01121F"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Windshield + side glass */}
      <path d="M240 106 L258 66 Q260 60 268 60 L294 60 L294 106 Z" fill="url(#t-glass)" stroke="#01121F" strokeWidth="3.5" />
      <rect x="198" y="126" width="34" height="30" rx="4" fill="url(#t-glass)" stroke="#01121F" strokeWidth="3" />

      {/* Door with the brand badge — the detail the whole scene is built around */}
      <rect x="240" y="118" width="56" height="74" rx="5" fill="none" stroke="#01121F" strokeWidth="3" opacity="0.5" />
      <circle cx="268" cy="150" r="19" fill="#053050" stroke="#F6BD0B" strokeWidth="2.5" />
      {/* Miniature brand snowflake on the door */}
      <g stroke="#F4FAF8" strokeWidth="2" strokeLinecap="round" transform="translate(268 150)">
        {[0, 60, 120].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1="0" y1="-11" x2="0" y2="11" />
            <path d="M0 -7 L-3.5 -10 M0 -7 L3.5 -10 M0 7 L-3.5 10 M0 7 L3.5 10" />
          </g>
        ))}
      </g>

      {/* Amber strobe on the roof */}
      <rect x="252" y="44" width="40" height="10" rx="4" fill="#F6BD0B" filter="url(#t-lamp)" />

      {/* Headlight beam wash */}
      <circle cx="196" cy="146" r="7" fill="#FFDD6B" filter="url(#t-lamp)" />

      {/* Wheels */}
      {[232, 420].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="196" r="34" fill="#01121F" />
          <circle cx={cx} cy="196" r="19" fill="#274354" />
          <circle cx={cx} cy="196" r="8" fill="#C4DDEC" />
        </g>
      ))}
      {/* Wheel arches */}
      <path d="M198 196 A34 34 0 0 1 266 196" fill="none" stroke="#01121F" strokeWidth="4.5" />
      <path d="M386 196 A34 34 0 0 1 454 196" fill="none" stroke="#01121F" strokeWidth="4.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Neighbourhood — Scene 3, the camera has lifted                      */
/* ------------------------------------------------------------------ */

export function Neighbourhood({ className }: { className?: string }) {
  const homes = Array.from({ length: 9 }, (_, i) => {
    const seed = (i * 7919 + 104729) % 65536;
    const rnd = seed / 65536;
    return {
      x: i * 168 + 30,
      w: 118 + rnd * 34,
      h: 96 + rnd * 46,
      lit: rnd > 0.42,
    };
  });

  return (
    <svg viewBox="0 0 1500 320" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <defs>
        <linearGradient id="n-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDD6B" />
          <stop offset="100%" stopColor="#F6BD0B" />
        </linearGradient>
      </defs>

      {homes.map((h, i) => {
        const roofY = 250 - h.h;
        return (
          <g key={i}>
            {/* Body */}
            <rect x={h.x} y={250 - h.h * 0.66} width={h.w} height={h.h * 0.66} fill={i % 2 ? "#053050" : "#04283F"} />
            {/* Gable */}
            <path d={`M${h.x - 10} ${250 - h.h * 0.66} L${h.x + h.w / 2} ${roofY} L${h.x + h.w + 10} ${250 - h.h * 0.66} Z`} fill="#042343" />
            {/* Roof snow */}
            <path
              d={`M${h.x + h.w / 2} ${roofY}
                  L${h.x + h.w + 10} ${250 - h.h * 0.66}
                  Q${h.x + h.w * 0.8} ${250 - h.h * 0.7} ${h.x + h.w * 0.66} ${250 - h.h * 0.72}
                  Q${h.x + h.w * 0.58} ${roofY + 8} ${h.x + h.w / 2} ${roofY} Z`}
              fill="#F4FAF8"
            />
            <path
              d={`M${h.x + h.w / 2} ${roofY}
                  L${h.x - 10} ${250 - h.h * 0.66}
                  Q${h.x + h.w * 0.2} ${250 - h.h * 0.7} ${h.x + h.w * 0.34} ${250 - h.h * 0.72}
                  Q${h.x + h.w * 0.42} ${roofY + 8} ${h.x + h.w / 2} ${roofY} Z`}
              fill="#EEF5FA"
            />
            {/* Windows */}
            <rect
              x={h.x + h.w * 0.2}
              y={250 - h.h * 0.5}
              width={h.w * 0.22}
              height={h.h * 0.2}
              rx="3"
              fill={h.lit ? "url(#n-lit)" : "#0A4472"}
              opacity={h.lit ? 0.95 : 0.5}
            />
            <rect
              x={h.x + h.w * 0.56}
              y={250 - h.h * 0.5}
              width={h.w * 0.22}
              height={h.h * 0.2}
              rx="3"
              fill={h.lit ? "#0A4472" : "url(#n-lit)"}
              opacity={h.lit ? 0.5 : 0.9}
            />
            {/* Cleared driveway strip */}
            <rect x={h.x + h.w * 0.28} y="250" width={h.w * 0.44} height="46" fill="#274354" rx="2" />
          </g>
        );
      })}

      {/* Street + snowbanks */}
      <rect x="0" y="296" width="1500" height="24" fill="#01121F" />
      <path d="M0 296 Q200 286 400 292 Q700 282 1000 290 Q1250 284 1500 292 L1500 296 L0 296 Z" fill="#F4FAF8" opacity="0.85" />
      {/* Centre line */}
      <line x1="0" y1="308" x2="1500" y2="308" stroke="#F6BD0B" strokeWidth="2.5" strokeDasharray="26 22" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Commercial district — Scene 4, everything is larger                 */
/* ------------------------------------------------------------------ */

export function CommercialDistrict({ className }: { className?: string }) {
  const towers = [
    { x: 60, w: 150, h: 320, cols: 4, rows: 9 },
    { x: 236, w: 118, h: 226, cols: 3, rows: 6 },
    { x: 380, w: 190, h: 392, cols: 5, rows: 11 },
    { x: 596, w: 134, h: 268, cols: 4, rows: 7 },
    { x: 756, w: 166, h: 344, cols: 4, rows: 10 },
    { x: 948, w: 122, h: 210, cols: 3, rows: 5 },
    { x: 1096, w: 178, h: 300, cols: 5, rows: 8 },
    { x: 1300, w: 140, h: 244, cols: 4, rows: 6 },
  ];

  return (
    <svg viewBox="0 0 1500 460" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <defs>
        <linearGradient id="c-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDD6B" />
          <stop offset="100%" stopColor="#F6BD0B" />
        </linearGradient>
      </defs>

      {towers.map((b, i) => {
        const top = 400 - b.h;
        const cellW = b.w / (b.cols + 1);
        const cellH = (b.h - 26) / (b.rows + 1);
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={i % 2 ? "#053050" : "#04283F"} />
            {/* Parapet snow */}
            <rect x={b.x - 6} y={top - 9} width={b.w + 12} height={11} rx="3" fill="#F4FAF8" />
            {/* Window grid — a deterministic lit/unlit pattern */}
            {Array.from({ length: b.rows }).map((_, r) =>
              Array.from({ length: b.cols }).map((__, c) => {
                const lit = ((r * 31 + c * 17 + i * 13) % 7) < 3;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={b.x + cellW * (c + 0.5)}
                    y={top + 20 + cellH * r}
                    width={cellW * 0.62}
                    height={cellH * 0.52}
                    rx="1.5"
                    fill={lit ? "url(#c-lit)" : "#0A4472"}
                    opacity={lit ? 0.85 : 0.42}
                  />
                );
              }),
            )}
          </g>
        );
      })}

      {/* Parking lot — cleared, with painted bays */}
      <rect x="0" y="400" width="1500" height="60" fill="#274354" />
      <path d="M0 400 Q160 392 320 398 Q640 388 960 396 Q1230 390 1500 398 L1500 402 L0 402 Z" fill="#F4FAF8" opacity="0.8" />
      {Array.from({ length: 26 }).map((_, i) => (
        <line
          key={i}
          x1={i * 58 + 18}
          y1="414"
          x2={i * 58 + 18}
          y2="452"
          stroke="#F6BD0B"
          strokeWidth="2.5"
          opacity="0.4"
        />
      ))}
      {/* Snow piled at the lot edges, where it actually ends up */}
      <path d="M0 400 Q40 372 90 384 Q126 366 160 400 Z" fill="#F4FAF8" opacity="0.9" />
      <path d="M1340 400 Q1382 370 1428 382 Q1466 364 1500 400 Z" fill="#F4FAF8" opacity="0.9" />
    </svg>
  );
}
