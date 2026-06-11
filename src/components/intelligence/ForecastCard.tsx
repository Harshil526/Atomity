import { motion, AnimatePresence } from "framer-motion";
import type { Forecast } from "@/hooks/useInsights";
import { Counter } from "./Counter";
import styles from "./membrane.module.css";

interface ForecastCardProps {
  forecast: Forecast;
  providerName: string;
  accentColor: string;
  reducedMotion: boolean;
  providerId: string;
  /** When true, metric rows reveal via whileInView stagger (scroll-driven) */
  staggerReveal?: boolean;
}

const TREND_ICON: Record<string, string> = {
  rising: "↑",
  stable: "→",
  declining: "↓",
};
const TREND_COLOR: Record<string, string> = {
  rising:   "var(--ins-critical)",
  stable:   "var(--ins-opportunity)",
  declining:"var(--ins-warning)",
};

const containerVar = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const itemVar = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ForecastCard({
  forecast,
  providerName,
  accentColor,
  reducedMotion,
  providerId,
  staggerReveal = false,
}: ForecastCardProps) {
  const rows = [
    {
      label: "Projected Monthly Cost",
      value: (
        <>
          $<Counter value={forecast.projectedMonthlyCost} />
        </>
      ),
      hint: "post-optimization estimate",
      highlight: false,
    },
    {
      label: "Predicted Savings",
      value: (
        <>
          <Counter value={forecast.predictedSavings} />%
        </>
      ),
      hint: "vs. current baseline spend",
      highlight: true,
    },
    {
      label: "Resource Efficiency Δ",
      value: (
        <>
          {forecast.resourceEfficiencyDelta >= 0 ? "+" : ""}
          <Counter value={Math.abs(forecast.resourceEfficiencyDelta)} />%
        </>
      ),
      hint: "relative to last 30-day avg",
      highlight: false,
    },
    {
      label: "GPU Utilization Trend",
      value: (
        <span style={{ color: TREND_COLOR[forecast.gpuTrend] }}>
          {TREND_ICON[forecast.gpuTrend]} {forecast.gpuTrend.charAt(0).toUpperCase() + forecast.gpuTrend.slice(1)}
        </span>
      ),
      hint: "based on workload momentum",
      highlight: false,
    },
    {
      label: "Network Growth",
      value: (
        <>
          +<Counter value={forecast.networkGrowth} />%
        </>
      ),
      hint: "30-day projected egress increase",
      highlight: false,
    },
  ];

  return (
    <div
      className={styles.forecastCard}
      style={{
        // @ts-expect-error css var
        "--forecast-accent": accentColor,
      }}
    >
      {/* Header */}
      <div className={styles.forecastHeader}>
        <div className={styles.forecastTitleRow}>
          <span className={styles.forecastLiveBadge} aria-label="Live forecast">
            <span className={styles.forecastLiveDot} aria-hidden />
            Live Forecast
          </span>
          <span className={styles.forecastProviderName}>{providerName}</span>
        </div>
        <p className={styles.forecastSubtitle}>
          Atomity intelligence layer is projecting outcomes based on current telemetry signals.
        </p>
      </div>

      {/* Utilization score arc */}
      <div className={styles.forecastArcWrap} aria-label={`Utilization score ${forecast.utilizationScore}%`}>
        <svg viewBox="0 0 120 70" fill="none" aria-hidden className={styles.forecastArc}>
          <path
            d="M 10 65 A 50 50 0 0 1 110 65"
            stroke="var(--mem-surface)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.path
            d="M 10 65 A 50 50 0 0 1 110 65"
            stroke={accentColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(forecast.utilizationScore / 100) * 157} 157`}
            initial={{ strokeDasharray: "0 157" }}
            animate={{ strokeDasharray: `${(forecast.utilizationScore / 100) * 157} 157` }}
            transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] as const }}
          />
          <text
            x="60"
            y="62"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="var(--mem-text)"
          >
            {forecast.utilizationScore}%
          </text>
          <text
            x="60"
            y="75"
            textAnchor="middle"
            fontSize="8"
            fill="var(--mem-text-subtle)"
            letterSpacing="1"
          >
            UTILIZATION
          </text>
        </svg>
      </div>

      {/* Forecast rows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={providerId}
          className={styles.forecastRows}
          variants={reducedMotion ? undefined : containerVar}
          initial="hidden"
          {...(staggerReveal && !reducedMotion
            ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
            : { animate: "visible" })}
          exit="exit"
        >
          {rows.map((row, i) => (
            <motion.div
              key={i}
              className={styles.forecastRow}
              variants={reducedMotion ? undefined : itemVar}
              data-highlight={row.highlight ? "true" : "false"}
              style={row.highlight ? { borderColor: `color-mix(in oklab, ${accentColor} 40%, var(--mem-border))` } : undefined}
            >
              <div className={styles.forecastRowLabel}>{row.label}</div>
              <div className={styles.forecastRowValue}>{row.value}</div>
              <div className={styles.forecastRowHint}>{row.hint}</div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
