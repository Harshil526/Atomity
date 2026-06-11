import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Insight, InsightSeverity, InsightCategory } from "@/hooks/useInsights";
import styles from "./membrane.module.css";

interface InsightsFeedProps {
  insights: Insight[];
  accentColor: string;
  reducedMotion: boolean;
  /** When true, rows reveal via whileInView (scroll-driven) */
  scrollReveal?: boolean;
}

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { label: string; color: string; icon: string }
> = {
  critical:    { label: "Critical",    color: "var(--ins-critical)",    icon: "⬆" },
  warning:     { label: "Warning",     color: "var(--ins-warning)",     icon: "◈" },
  opportunity: { label: "Opportunity", color: "var(--ins-opportunity)", icon: "◆" },
  info:        { label: "Info",        color: "var(--ins-info)",        icon: "◉" },
};

const CATEGORY_ICONS: Record<InsightCategory, string> = {
  cost:        "💰",
  performance: "⚡",
  reliability: "🛡",
  security:    "🔐",
};

function impactColor(val: number): string {
  if (val >= 20) return "var(--ins-opportunity)";
  if (val >= 12) return "var(--ins-warning)";
  return "var(--ins-info)";
}

export function InsightsFeed({ insights, accentColor, reducedMotion, scrollReveal = false }: InsightsFeedProps) {
  const [scanIndex, setScanIndex] = useState(0);

  // ── Auto-cycle timer ────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || insights.length < 2) return;
    const t = setInterval(() => {
      setScanIndex((i) => (i + 1) % insights.length);
    }, 4200);
    return () => clearInterval(t);
  }, [insights.length, reducedMotion]);

  // ── Reset when provider changes (insights array identity changes) ─
  // Reset immediately to 0 so the render below never sees an OOB index.
  const safeIndex = Math.min(scanIndex, Math.max(0, insights.length - 1));
  // Keep state in sync asynchronously so next interval is also correct.
  useEffect(() => {
    setScanIndex(0);
  }, [insights]);

  // Early-out AFTER computing safeIndex (hooks must always run in same order)
  if (!insights.length) return null;

  // The insight we will display in the ticker — always defined
  const activeInsight = insights[safeIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reducedMotion ? 0 : 0.09, delayChildren: 0.1 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div
      className={styles.insightsFeed}
      style={{
        // @ts-expect-error custom css var
        "--feed-accent": accentColor,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className={styles.insightsHeader}>
        <span className={styles.insightsPulse} aria-hidden />
        <span className={styles.insightsTitle}>Analysis Engine</span>
        <span className={styles.insightsBadge}>
          {insights.length} signal{insights.length !== 1 ? "s" : ""} detected
        </span>
      </div>

      {/* ── Cycling ticker ──────────────────────────────────────── */}
      <div className={styles.insightsTicker} aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {activeInsight && (
            <motion.div
              key={`${safeIndex}-${activeInsight.id}`}
              className={styles.insightsTick}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <span
                className={styles.insightsTickDot}
                style={{ background: SEVERITY_CONFIG[activeInsight.severity].color }}
              />
              <span className={styles.insightsTickText}>
                {CATEGORY_ICONS[activeInsight.category]}&nbsp;
                {activeInsight.title}
              </span>
              <span
                className={styles.insightsTickImpact}
                style={{ color: impactColor(activeInsight.impactValue) }}
              >
                {activeInsight.impact}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className={styles.insightsTickDots} aria-hidden>
          {insights.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.insightsDotBtn}
              data-active={i === safeIndex ? "true" : "false"}
              onClick={() => setScanIndex(i)}
              aria-label={`View insight ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Full insight list ────────────────────────────────────── */}
      <motion.ul
        className={styles.insightsList}
        variants={containerVariants}
        initial="hidden"
        {...(scrollReveal && !reducedMotion
          ? { whileInView: "visible", viewport: { once: true, amount: 0.1 } }
          : { animate: "visible" })}
        role="list"
      >
        {insights.map((ins) => {
          const sev = SEVERITY_CONFIG[ins.severity];
          return (
            <motion.li
              key={ins.id}
              className={styles.insightRow}
              variants={rowVariants}
              style={{ "--ins-row-color": sev.color } as React.CSSProperties}
              whileHover={reducedMotion ? undefined : { x: 3, transition: { duration: 0.18 } }}
            >
              <div className={styles.insightRowLeft}>
                <span className={styles.insightRowIcon} aria-hidden>
                  {CATEGORY_ICONS[ins.category]}
                </span>
                <div className={styles.insightRowContent}>
                  <div className={styles.insightRowTitle}>{ins.title}</div>
                  <div className={styles.insightRowDetail}>{ins.detail}</div>
                  <div className={styles.insightRowBar} role="presentation">
                    <motion.div
                      className={styles.insightRowBarFill}
                      style={{ background: impactColor(ins.impactValue) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${ins.impactValue}%` }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.9,
                        ease: [0.22, 1, 0.36, 1] as const,
                        delay: 0.2,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.insightRowRight}>
                <span
                  className={styles.insightSeverityChip}
                  style={{
                    color: sev.color,
                    borderColor: `color-mix(in oklab, ${sev.color} 35%, transparent)`,
                    background: `color-mix(in oklab, ${sev.color} 10%, transparent)`,
                  }}
                >
                  {sev.icon} {sev.label}
                </span>
                <span className={styles.insightImpactLabel}>{ins.impact}</span>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
