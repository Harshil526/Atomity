/**
 * Design tokens — semantic, theme-aware.
 * All values resolve to CSS custom properties defined in styles.css.
 * Components must reference these tokens, never raw hex.
 */
export const tokens = {
  colors: {
    bg: "var(--mem-bg)",
    bgElevated: "var(--mem-bg-elevated)",
    surface: "var(--mem-surface)",
    border: "var(--mem-border)",
    text: "var(--mem-text)",
    textMuted: "var(--mem-text-muted)",
    textSubtle: "var(--mem-text-subtle)",
    accent: "var(--mem-accent)",
    accentSoft: "var(--mem-accent-soft)",
    success: "var(--mem-success)",
    warning: "var(--mem-warning)",
    danger: "var(--mem-danger)",
    aws: "var(--mem-aws)",
    azure: "var(--mem-azure)",
    gcp: "var(--mem-gcp)",
    onprem: "var(--mem-onprem)",
  },
  radius: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    pill: "999px",
  },
  shadow: {
    soft: "0 1px 2px color-mix(in oklab, var(--mem-text) 6%, transparent), 0 8px 24px color-mix(in oklab, var(--mem-text) 8%, transparent)",
    glow: "0 0 0 1px color-mix(in oklab, var(--mem-accent) 40%, transparent), 0 0 48px color-mix(in oklab, var(--mem-accent) 30%, transparent)",
  },
  ease: {
    out: [0.22, 1, 0.36, 1] as const,
    inOut: [0.65, 0, 0.35, 1] as const,
  },
} as const;

export type ProviderId = "aws" | "azure" | "gcp" | "onprem";