import { AnimatePresence, motion } from "framer-motion";
import type { ProviderMeta } from "@/data/providers";
import type { ProviderMetrics } from "@/hooks/useInfraData";
import { Counter } from "./Counter";
import { Badge } from "./Badge";
import styles from "./membrane.module.css";

interface DetailPanelProps {
  provider: ProviderMeta;
  metrics?: ProviderMetrics;
  reducedMotion: boolean;
}

const METRICS: Array<{ key: keyof ProviderMetrics; label: string; suffix?: string }> = [
  { key: "cpu", label: "CPU Usage", suffix: "%" },
  { key: "memory", label: "Memory", suffix: "%" },
  { key: "network", label: "Network", suffix: "%" },
  { key: "gpu", label: "GPU Load", suffix: "%" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut" as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function DetailPanel({ provider, metrics, reducedMotion }: DetailPanelProps) {
  return (
    <article
      className={styles.panel}
      style={{
        // @ts-expect-error css var
        "--panel-accent": provider.colorVar,
      }}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={provider.id}
          variants={reducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ width: "100%" }}
        >
          <motion.header
            className={styles.panelHead}
            variants={reducedMotion ? undefined : itemVariants}
          >
            <h3>
              <span className={styles.panelDot} />
              {provider.name}
            </h3>
            <Badge tone="success" dot>
              {metrics ? `${metrics.regions} regions` : "—"}
            </Badge>
          </motion.header>

          <div className={styles.metricGrid}>
            {METRICS.map((m) => {
              const v = metrics ? Number(metrics[m.key]) : 0;
              return (
                <motion.div
                  key={m.key}
                  className={styles.metric}
                  variants={reducedMotion ? undefined : itemVariants}
                  whileHover={
                    reducedMotion
                      ? undefined
                      : {
                          y: -2,
                          borderColor: "color-mix(in oklab, var(--panel-accent) 50%, var(--mem-border))",
                          boxShadow: "0 6px 20px -8px color-mix(in oklab, var(--panel-accent) 20%, transparent)",
                        }
                  }
                  transition={{ duration: 0.2 }}
                >
                  <div className="metricLabel">{m.label}</div>
                  <div className="metricValue">
                    <Counter value={v} />{m.suffix}
                  </div>
                  <div className="metricBar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
                    <motion.div
                      className="metricBarFill"
                      initial={{ width: 0 }}
                      animate={{ width: `${v}%` }}
                      transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className={styles.summary}>
            <motion.div
              className={styles.summaryCard}
              variants={reducedMotion ? undefined : itemVariants}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -2,
                      borderColor: "color-mix(in oklab, var(--panel-accent) 40%, var(--mem-border))",
                      boxShadow: "0 6px 20px -8px color-mix(in oklab, var(--panel-accent) 15%, transparent)",
                    }
              }
              transition={{ duration: 0.2 }}
            >
              <div className="summaryLabel">Estimated Savings</div>
              <div className="summaryValue">
                $<Counter value={metrics?.savings ?? 0} />
              </div>
              <div className="summaryHint">Per month, post-optimization</div>
            </motion.div>

            <motion.div
              className={styles.summaryCard}
              variants={reducedMotion ? undefined : itemVariants}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -2,
                      borderColor: "color-mix(in oklab, var(--panel-accent) 40%, var(--mem-border))",
                      boxShadow: "0 6px 20px -8px color-mix(in oklab, var(--panel-accent) 15%, transparent)",
                    }
              }
              transition={{ duration: 0.2 }}
            >
              <div className="summaryLabel">Efficiency Score</div>
              <div className="summaryValue">
                <Counter value={metrics?.efficiency ?? 0} />
                <span style={{ fontSize: "1rem", color: "var(--mem-text-muted)" }}> / 100</span>
              </div>
              <div className="summaryHint">{metrics?.workloads ?? 0} active workloads</div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}