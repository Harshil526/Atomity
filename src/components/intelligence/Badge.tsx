import type { ReactNode } from "react";
import styles from "./membrane.module.css";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "accent";
  dot?: boolean;
}

export function Badge({ children, tone = "neutral", dot }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {dot && <span className={styles.badgeDot} aria-hidden />}
      {children}
    </span>
  );
}