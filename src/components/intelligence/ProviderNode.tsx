import { motion } from "framer-motion";
import type { ProviderMeta } from "@/data/providers";
import type { ProviderMetrics } from "@/hooks/useInfraData";
import styles from "./membrane.module.css";

interface ProviderNodeProps {
  provider: ProviderMeta;
  metrics?: ProviderMetrics;
  x: number;
  y: number;
  selected: boolean;
  dim: boolean;
  index: number;
  active: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  reducedMotion: boolean;
}

export function ProviderNode({
  provider,
  metrics,
  x,
  y,
  selected,
  dim,
  index,
  active,
  onSelect,
  onHover,
  reducedMotion,
}: ProviderNodeProps) {
  // Phase 2 stagger: 80–120ms between cards
  // AWS(0) → Azure(1) → GCP(2) → On-Prem(3)
  const staggerDelay = reducedMotion ? 0 : index * 0.1;

  return (
    <motion.button
      type="button"
      className={styles.providerNode}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        // @ts-expect-error css var
        "--prov-color": provider.colorVar,
      }}
      data-active={selected ? "true" : "false"}
      data-dim={dim ? "true" : "false"}
      onClick={onSelect}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-pressed={selected}
      aria-label={`Inspect ${provider.name}`}
      initial={
        reducedMotion
          ? { opacity: 0 }
          : provider.id === "aws"
          ? { opacity: 0, scale: 0.82, x: -120, y: 0 }
          : provider.id === "azure"
          ? { opacity: 0, scale: 0.82, x: 120, y: 0 }
          : provider.id === "gcp"
          ? { opacity: 0, scale: 0.82, x: 120, y: 120 }
          : { opacity: 0, scale: 0.82, x: -120, y: 120 }
      }
      animate={
        active
          ? { opacity: 1, scale: 1, x: 0, y: 0 }
          : reducedMotion
          ? { opacity: 0 }
          : provider.id === "aws"
          ? { opacity: 0, scale: 0.82, x: -120, y: 0 }
          : provider.id === "azure"
          ? { opacity: 0, scale: 0.82, x: 120, y: 0 }
          : provider.id === "gcp"
          ? { opacity: 0, scale: 0.82, x: 120, y: 120 }
          : { opacity: 0, scale: 0.82, x: -120, y: 120 }
      }
      transition={{
        duration: reducedMotion ? 0 : 0.75,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }
      }
    >
      <div className="provHead">
        <span className="provDot" />
        <span className="provName">{provider.short}</span>
      </div>
      <div className="provTag">{provider.tagline}</div>
      <div className="provStat">
        <span className="provStatNum">{metrics ? `${metrics.efficiency}%` : "—"}</span>
        <span className="provStatLabel">Efficiency</span>
      </div>
    </motion.button>
  );
}