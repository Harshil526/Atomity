import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ProviderMetrics } from "@/hooks/useInfraData";

interface RadarGraphProps {
  metrics: ProviderMetrics | undefined;
  color: string;
  reducedMotion: boolean;
}

const CX = 200;
const CY = 200;
const R_MIN = 60;
const R_MAX = 165;
const AXES = 5;

function polarPoint(index: number, value: number): { x: number; y: number } {
  const angleRad = (index * (360 / AXES) - 90) * (Math.PI / 180);
  const r = R_MIN + (R_MAX - R_MIN) * Math.max(0, Math.min(100, value)) / 100;
  return {
    x: CX + r * Math.cos(angleRad),
    y: CY + r * Math.sin(angleRad),
  };
}

function buildPath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";
}

function buildWebPath(scale: number): string {
  const pts = Array.from({ length: AXES }, (_, i) => {
    const angleRad = (i * (360 / AXES) - 90) * (Math.PI / 180);
    const r = R_MIN + (R_MAX - R_MIN) * scale;
    return { x: CX + r * Math.cos(angleRad), y: CY + r * Math.sin(angleRad) };
  });
  return buildPath(pts);
}

const GRID_SCALES = [0.25, 0.5, 0.75, 1.0];
const AXIS_LABELS = ["CPU", "GPU", "MEM", "NET", "EFF"];

export function RadarGraph({ metrics, color, reducedMotion }: RadarGraphProps) {
  // Fallback to neutral 50% values until metrics load — never NaN
  const values = useMemo<number[]>(() => {
    if (!metrics) return [50, 50, 50, 50, 50];
    return [
      Number(metrics.cpu)        || 50,
      Number(metrics.gpu)        || 50,
      Number(metrics.memory)     || 50,
      Number(metrics.network)    || 50,
      Number(metrics.efficiency) || 50,
    ];
  }, [metrics]);

  const dataPoints = useMemo(() => values.map((v, i) => polarPoint(i, v)), [values]);
  const pathD      = useMemo(() => buildPath(dataPoints), [dataPoints]);
  const gridPaths  = useMemo(() => GRID_SCALES.map(buildWebPath), []);

  const labelPositions = useMemo(() => {
    const rLabel = R_MAX + 20;
    return AXIS_LABELS.map((label, i) => {
      const angleRad = (i * (360 / AXES) - 90) * (Math.PI / 180);
      return {
        x: CX + rLabel * Math.cos(angleRad),
        y: CY + rLabel * Math.sin(angleRad),
        label,
        anchor: i === 0 ? "middle" : angleRad < -Math.PI / 2 || angleRad > Math.PI / 2 ? "end" : "start",
      };
    });
  }, []);

  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "visible",
      }}
    >
      {/* Background web */}
      {gridPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--mem-text)"
          strokeOpacity={0.05 + i * 0.01}
          strokeWidth={1}
        />
      ))}

      {/* Axis spines */}
      {Array.from({ length: AXES }, (_, i) => {
        const angleRad = (i * (360 / AXES) - 90) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={(CX + R_MIN * Math.cos(angleRad)).toFixed(2)}
            y1={(CY + R_MIN * Math.sin(angleRad)).toFixed(2)}
            x2={(CX + R_MAX * Math.cos(angleRad)).toFixed(2)}
            y2={(CY + R_MAX * Math.sin(angleRad)).toFixed(2)}
            stroke="var(--mem-text)"
            strokeOpacity={0.06}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        );
      })}

      {/* ── Data shape — use CSS transition, NOT Framer animate on `d`  ── */}
      {/* Framer Motion cannot morph SVG paths reliably; CSS transition can't  */}
      {/* animate `d` either, so we simply re-render on metric change and let  */}
      {/* the fill opacity cross-fade via a motion wrapper.                    */}
      <motion.path
        d={pathD}
        fill={color}
        fillOpacity={0.13}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        // Animate only opacity & color — NOT the `d` attribute
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, fill: color, stroke: color }}
        transition={{ duration: reducedMotion ? 0 : 0.55, ease: "easeOut" }}
        key={pathD}  // remount on shape change → triggers fresh fade-in
      />

      {/* Vertex dots — plain SVG circles, no animated cx/cy */}
      {dataPoints.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x.toFixed(2)}
          cy={pt.y.toFixed(2)}
          r={3.5}
          fill={color}
          stroke="var(--mem-bg-elevated)"
          strokeWidth={1.5}
          style={{
            transition: reducedMotion ? "none" : "cx 0.55s cubic-bezier(0.22,1,0.36,1), cy 0.55s cubic-bezier(0.22,1,0.36,1), fill 0.55s ease",
          }}
        />
      ))}

      {/* Axis labels */}
      {labelPositions.map((pos) => (
        <text
          key={pos.label}
          x={pos.x.toFixed(2)}
          y={pos.y.toFixed(2)}
          fill="var(--mem-text-subtle)"
          fontSize="9"
          fontWeight="600"
          letterSpacing="0.08em"
          textAnchor={pos.anchor as "middle" | "start" | "end"}
          dominantBaseline="middle"
          opacity={0.65}
          style={{ userSelect: "none" }}
        >
          {pos.label}
        </text>
      ))}
    </svg>
  );
}
