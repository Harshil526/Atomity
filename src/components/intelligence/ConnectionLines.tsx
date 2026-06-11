import { motion } from "framer-motion";
import { PROVIDERS } from "@/data/providers";
import type { ProviderId } from "@/tokens";

interface ConnectionLinesProps {
  /** stage size in svg units */
  size: number;
  centerR: number;
  nodeR: number;
  selected: ProviderId | null;
  hovered: ProviderId | null;
  /** Phase 3: triggers SVG path draw animation */
  active: boolean;
  /** Phase 4: triggers data packet / particle flow (requires active=true first) */
  particlesActive: boolean;
  reducedMotion: boolean;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function ConnectionLines({
  size,
  centerR,
  nodeR,
  selected,
  hovered,
  active,
  particlesActive,
  reducedMotion,
}: ConnectionLinesProps) {
  const cx = size / 2;
  const cy = size / 2;

  // Provider-specific base flow durations (seconds)
  const getParticleDur = (id: ProviderId, isSel: boolean, isHov: boolean) => {
    const base = id === "aws" ? 2.4 : id === "azure" ? 3.0 : id === "gcp" ? 2.7 : 3.6;
    if (isSel) return base * 0.5;
    if (isHov) return base * 0.7;
    return base;
  };

  // Stagger path draw delay per provider index
  const providerIndex = (id: ProviderId) =>
    PROVIDERS.findIndex((p) => p.id === id);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <defs>
        <filter id="glow-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-heavy" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients from provider → membrane */}
        {PROVIDERS.map((p) => (
          <linearGradient
            key={p.id}
            id={`grad-${p.id}`}
            gradientUnits="userSpaceOnUse"
            x1={polar(cx, cy, nodeR, p.angle).x}
            y1={polar(cx, cy, nodeR, p.angle).y}
            x2={polar(cx, cy, centerR, p.angle).x}
            y2={polar(cx, cy, centerR, p.angle).y}
          >
            <stop offset="0%"   stopColor={p.colorVar} stopOpacity="0.85" />
            <stop offset="65%"  stopColor={p.colorVar} stopOpacity="0.4" />
            <stop offset="100%" stopColor={p.colorVar} stopOpacity="0.15" />
          </linearGradient>
        ))}
      </defs>

      {/* ── Phase 5: Orbital rings — only spin after membrane activates ── */}
      {[
        { r: centerR * 1.15, dash: "4 8",  dir: 1,  dur: 45 },
        { r: centerR * 1.38, dash: "1 12", dir: -1, dur: 65 },
        { r: centerR * 1.65, dash: "2 16", dir: 1,  dur: 90 },
      ].map((ring, i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={ring.r}
          fill="none"
          stroke="var(--mem-text)"
          strokeOpacity={0.06 - i * 0.015}
          strokeDasharray={ring.dash}
          initial={{ opacity: 0 }}
          animate={
            particlesActive && !reducedMotion
              ? { opacity: 1, rotate: ring.dir * 360 }
              : active
              ? { opacity: 0.4 }
              : { opacity: 0 }
          }
          transition={
            particlesActive && !reducedMotion
              ? {
                  opacity: { duration: 0.8, ease: "easeOut" },
                  rotate: { repeat: Infinity, duration: ring.dur, ease: "linear" },
                }
              : { duration: 0.4 }
          }
          style={{ transformOrigin: "center" }}
        />
      ))}

      {/* ── Phase 5: Energy diffusion ripples ─────────────────────────── */}
      {particlesActive && !reducedMotion && (
        <>
          {[0, 1.5].map((delay, idx) => (
            <motion.circle
              key={idx}
              cx={cx}
              cy={cy}
              r={centerR}
              fill="none"
              stroke={selected ? `var(--mem-${selected})` : "var(--mem-accent)"}
              strokeWidth={1.5}
              initial={{ scale: 1, opacity: 0.25 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "center" }}
            />
          ))}
        </>
      )}

      {PROVIDERS.map((p) => {
        const start = polar(cx, cy, nodeR, p.angle);
        const end   = polar(cx, cy, centerR, p.angle);
        const isSelected = selected === p.id;
        const isHover    = hovered === p.id;
        const dim        = selected !== null && !isSelected;
        const strokeWidth = isSelected ? 3.0 : isHover ? 2.0 : 1.2;
        const opacity     = dim ? 0.22 : 1.0;
        const particleDur = getParticleDur(p.id, isSelected, isHover);
        const pathD       = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

        // Phase 3: stagger path drawing — each provider 120ms apart
        const pathDrawDelay = reducedMotion ? 0 : providerIndex(p.id) * 0.12;

        return (
          <g key={p.id} style={{ opacity, transition: "opacity 320ms ease" }}>

            {/* Selected glow trace */}
            {isSelected && particlesActive && !reducedMotion && (
              <motion.path
                d={pathD}
                stroke={p.colorVar}
                strokeWidth={strokeWidth * 2.5}
                fill="none"
                strokeLinecap="round"
                opacity={0.25}
                filter="url(#glow-heavy)"
              />
            )}

            {/* ── Phase 3: Base line draws itself ───────────────────── */}
            <motion.path
              d={pathD}
              stroke={`url(#grad-${p.id})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                active
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: {
                  duration: reducedMotion ? 0 : 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: pathDrawDelay,
                },
                opacity: {
                  duration: reducedMotion ? 0 : 0.3,
                  delay: pathDrawDelay,
                },
              }}
            />

            {/* ── Phase 4: Flowing dash packets — only after paths drawn ── */}
            {particlesActive && !reducedMotion && (
              <motion.path
                d={pathD}
                stroke={p.colorVar}
                strokeWidth={strokeWidth * 1.2}
                strokeDasharray="12 48"
                fill="none"
                strokeLinecap="round"
                opacity={isSelected ? 0.8 : isHover ? 0.5 : 0.25}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: [0, -60] }}
                transition={{
                  duration: particleDur,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}

            {/* ── Phase 4: Individual pulsing data packets ─────────────── */}
            {particlesActive && !reducedMotion && particleDur > 0 && (
              <>
                {[0, 0.5].map((delay, idx) => (
                  <circle
                    key={idx}
                    r={isSelected ? 4.0 : 2.5}
                    fill={p.colorVar}
                    opacity={0}
                    filter="url(#glow-soft)"
                  >
                    <animateMotion
                      dur={`${particleDur}s`}
                      repeatCount="indefinite"
                      begin={`${delay * particleDur}s`}
                      path={pathD}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      keyTimes="0;0.12;0.88;1"
                      dur={`${particleDur}s`}
                      repeatCount="indefinite"
                      begin={`${delay * particleDur}s`}
                    />
                  </circle>
                ))}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export { polar };