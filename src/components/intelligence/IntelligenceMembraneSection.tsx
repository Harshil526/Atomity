import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { PROVIDERS } from "@/data/providers";
import { useInfraData, type ProviderMetrics } from "@/hooks/useInfraData";
import { useInsights } from "@/hooks/useInsights";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProviderId } from "@/tokens";
import { ConnectionLines, polar } from "./ConnectionLines";
import { ProviderNode } from "./ProviderNode";
import { DetailPanel } from "./DetailPanel";
import { InsightsFeed } from "./InsightsFeed";
import { ForecastCard } from "./ForecastCard";
import { Counter } from "./Counter";
import { RadarGraph } from "./RadarGraph";
import styles from "./membrane.module.css";

const STAGE = 1000;
const CENTER_R = 240;
const NODE_R = 410;
const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Shared variant factories ──────────────────────────────────────────────────
const fadeUp = (delay = 0, y = 32) => ({
  hidden: { opacity: 0, y, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE, delay },
  },
});

const staggerContainer = (stagger = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});

const staggerItem = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

// ─── Section label divider ─────────────────────────────────────────────────────
function StageDivider({ label, icon }: { label: string; icon: string }) {
  return (
    <motion.div
      className={styles.stageDivider}
      variants={fadeUp(0, 20)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <span className={styles.stageDividerIcon} aria-hidden>{icon}</span>
      <span className={styles.stageDividerLabel}>{label}</span>
      <span className={styles.stageDividerLine} aria-hidden />
    </motion.div>
  );
}

export function IntelligenceMembraneSection() {
  const reduced = useReducedMotion();

  // ── API / data ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useInfraData();
  const [selected, setSelected] = useState<ProviderId>("aws");
  const [hovered, setHovered] = useState<ProviderId | null>(null);

  const metricsById = useMemo(() => {
    const m: Record<string, ProviderMetrics> = {};
    (data ?? []).forEach((d) => (m[d.id] = d));
    return m;
  }, [data]);

  const selectedMeta = PROVIDERS.find((p) => p.id === selected)!;
  const { insights, forecast } = useInsights(metricsById, selected);

  // ── Scroll sentinels (one per stage) ──────────────────────────────────────
  // Stage 2: provider cards
  const providerSentinelRef = useRef<HTMLDivElement>(null);
  const providersInView = useInView(providerSentinelRef, {
    once: true,
    amount: reduced ? 0 : 0.2,
  });

  // Stage 3–5: connection paths + membrane activation
  const stageSentinelRef = useRef<HTMLDivElement>(null);
  const stageInView = useInView(stageSentinelRef, {
    once: true,
    amount: reduced ? 0 : 0.25,
  });

  // Phase gates — short time-offsets give the "coming alive" feel
  const [pathsActive, setPathsActive] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);
  const [membraneGlowing, setMembraneGlowing] = useState(false);
  const [innerVisible, setInnerVisible] = useState(false);

  useEffect(() => {
    if (!stageInView) return;
    if (reduced) {
      setPathsActive(true);
      setParticlesActive(true);
      setMembraneGlowing(true);
      setInnerVisible(true);
      return;
    }
    const t1 = setTimeout(() => setPathsActive(true), 300);
    const t2 = setTimeout(() => setParticlesActive(true), 1200);
    const t3 = setTimeout(() => setMembraneGlowing(true), 1300);
    const t4 = setTimeout(() => setInnerVisible(true), 1550);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [stageInView, reduced]);

  // Stage 6: analysis engine + forecast
  const analysisSentinelRef = useRef<HTMLDivElement>(null);
  const analysisInView = useInView(analysisSentinelRef, {
    once: true,
    amount: reduced ? 0 : 0.18,
  });

  return (
    <section
      id="intelligence"
      className={styles.storySection}
      aria-labelledby="im-heading"
    >
      {/* ══════════════════════════════════════════════════════════════
          STAGE 1 — Section intro heading
      ════════════════════════════════════════════════════════════════ */}
<motion.header
  className={styles.header}
  variants={fadeUp(0)}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.4 }}
>
  <span className={styles.kicker}>
    <span aria-hidden /> Unified Cloud Intelligence
  </span>

  <h2 id="im-heading">One View Across Every Cluster</h2>

  <p className={styles.description}>
  <p className={styles.description}>
  Aggregate signals across every cloud and cluster through a unified intelligence layer,
  surfacing optimization opportunities, forecasts, and actionable operational insights.
</p>
  </p>
</motion.header>

      {/* ══════════════════════════════════════════════════════════════
          STAGE 2 — Provider cards stagger in as cloud sources
      ════════════════════════════════════════════════════════════════ */}
      <div ref={providerSentinelRef}>
        {/* Provider selector toolbar */}
        <motion.div
          className={styles.toolbar}
          role="tablist"
          aria-label="Select provider"
          variants={staggerContainer(0.09, 0.05)}
          initial="hidden"
          animate={providersInView || reduced ? "visible" : "hidden"}
        >
          {PROVIDERS.map((p) => (
            <motion.button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected === p.id}
              className={styles.chip}
              data-active={selected === p.id ? "true" : "false"}
              onClick={() => setSelected(p.id)}
              variants={staggerItem}
            >
              {p.short}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STAGE 3–5 — Constellation + Membrane + Detail Panel
      ════════════════════════════════════════════════════════════════ */}
      <div ref={stageSentinelRef} className={styles.membraneStageRow}>

        {/* ── Left: Constellation stage ──────────────────────────── */}
        <motion.div
          className={styles.stage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={stageInView || reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
        >
          {/* SVG connection paths + particles */}
          <ConnectionLines
            size={STAGE}
            centerR={CENTER_R}
            nodeR={NODE_R}
            selected={selected}
            hovered={hovered}
            active={pathsActive}
            particlesActive={particlesActive}
            reducedMotion={reduced}
          />

          {/* Central membrane orb */}
          <motion.div
            className={styles.membrane}
            style={{ "--membrane-glow": selectedMeta.colorVar } as React.CSSProperties}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              membraneGlowing
                ? { opacity: 1, scale: [1, 1.025, 1] }
                : pathsActive
                ? { opacity: 0.35, scale: 0.85 }
                : { opacity: 0, scale: 0.5 }
            }
            transition={
              membraneGlowing
                ? {
                    opacity: { duration: reduced ? 0 : 0.7, ease: EASE },
                    scale: { duration: reduced ? 0 : 6, repeat: Infinity, ease: "easeInOut" },
                  }
                : { duration: reduced ? 0 : 0.6, ease: EASE }
            }
          >
            {/* Inner radar + counters */}
            <motion.div
              className={styles.membraneInner}
              initial={{ opacity: 0 }}
              animate={{ opacity: innerVisible ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
            >
              <RadarGraph
                metrics={metricsById[selected]}
                color={selectedMeta.colorVar}
                reducedMotion={reduced}
              />
              <motion.div
                style={{ position: "relative", zIndex: 2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: innerVisible ? 1 : 0, y: innerVisible ? 0 : 10 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: EASE, delay: reduced ? 0 : 0.12 }}
              >
                <div className={styles.membraneLabel}>{selectedMeta.short} Core</div>
                <div className={styles.membraneValue}>
                  <Counter value={metricsById[selected]?.efficiency ?? 0} delay={reduced ? 0 : 0.2} />%
                </div>
                <div className={styles.membraneSub}>
                  <Counter value={metricsById[selected]?.workloads ?? 0} delay={reduced ? 0 : 0.38} />
                  {" "}workloads · $
                  <Counter value={metricsById[selected]?.savings ?? 0} delay={reduced ? 0 : 0.55} />
                  {" "}saved
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Provider nodes — staggered entrance driven by providersInView */}
          {PROVIDERS.map((p, i) => {
            const pt = polar(STAGE / 2, STAGE / 2, NODE_R, p.angle);
            return (
              <ProviderNode
                key={p.id}
                provider={p}
                metrics={metricsById[p.id]}
                x={(pt.x / STAGE) * 100}
                y={(pt.y / STAGE) * 100}
                index={i}
                selected={selected === p.id}
                dim={selected !== null && selected !== p.id}
                onSelect={() => setSelected(p.id)}
                onHover={(h) => setHovered(h ? p.id : null)}
                reducedMotion={reduced}
                active={providersInView}
              />
            );
          })}
        </motion.div>

        {/* ── Right: Detail Panel ────────────────────────────────── */}
        <motion.div
          className={styles.detailPanelCol}
          initial={{ opacity: 0, x: reduced ? 0 : 48 }}
          animate={innerVisible || reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 48 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : 0.15 }}
        >
          <AnimatePresence mode="wait">
            {innerVisible && (
              <motion.div
                key={`detail-${selected}`}
                initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                style={{ height: "100%" }}
              >
                {isLoading && (
                  <div className={styles.panel} aria-busy="true">
                    <div className={styles.skeleton} style={{ height: 28, width: "55%", marginBlockEnd: 18 }} />
                    <div className={styles.metricGrid}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={styles.metric}>
                          <div className={styles.skeleton} style={{ height: 10, width: "40%" }} />
                          <div className={styles.skeleton} style={{ height: 24, width: "60%", marginBlockStart: 8 }} />
                          <div className={styles.skeleton} style={{ height: 4, marginBlockStart: 14 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isError && (
                  <div className={styles.panel}>
                    <div className={styles.status}>
                      <p>We couldn't reach the telemetry service.</p>
                      <button className={styles.chip} onClick={() => refetch()}>Retry</button>
                    </div>
                  </div>
                )}
                {!isLoading && !isError && !data?.length && (
                  <div className={styles.panel}>
                    <div className={styles.status}>No telemetry yet — connect a provider to begin.</div>
                  </div>
                )}
                {!isLoading && !isError && !!data?.length && (
                  <DetailPanel
                    provider={selectedMeta}
                    metrics={metricsById[selected]}
                    reducedMotion={reduced}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STAGE 6–8 — Analysis Engine + Forecast Layer (side-by-side)
      ════════════════════════════════════════════════════════════════ */}
      <div ref={analysisSentinelRef}>
        <StageDivider label="Intelligence Output" icon="⚙" />

        <div className={styles.insightsForecastRow}>

          {/* ── Left: Analysis Engine ─────────────────────────────── */}
          <motion.div
            className={styles.analysisReveal}
            initial={{ opacity: 0, x: reduced ? 0 : -60, filter: reduced ? "none" : "blur(8px)" }}
            animate={
              analysisInView || reduced
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: -60, filter: "blur(8px)" }
            }
            transition={{ duration: reduced ? 0 : 0.75, ease: EASE }}
          >
            {isLoading && (
              <div className={styles.panel} aria-busy="true" style={{ minHeight: 280 }}>
                <div className={styles.skeleton} style={{ height: 16, width: "40%", marginBlockEnd: 12 }} />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} style={{ height: 64, marginBlockEnd: 8, borderRadius: 12 }} />
                ))}
              </div>
            )}
            {!isLoading && !isError && insights.length > 0 && (
              <InsightsFeed
                insights={insights}
                accentColor={selectedMeta.colorVar}
                reducedMotion={reduced}
                scrollReveal
              />
            )}
          </motion.div>

          {/* ── Right: Forecast Layer ──────────────────────────────── */}
          <motion.div
            className={styles.forecastReveal}
            initial={{ opacity: 0, x: reduced ? 0 : 60, filter: reduced ? "none" : "blur(8px)" }}
            animate={
              analysisInView || reduced
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: 60, filter: "blur(8px)" }
            }
            transition={{ duration: reduced ? 0 : 0.8, ease: EASE, delay: reduced ? 0 : 0.08 }}
          >
            {!isLoading && !isError && (
              <ForecastCard
                forecast={forecast}
                providerName={selectedMeta.name}
                accentColor={selectedMeta.colorVar}
                reducedMotion={reduced}
                providerId={selected}
                staggerReveal={analysisInView}
              />
            )}
          </motion.div>

        </div>
      </div>

    </section>
  );
}
