import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./membrane.module.css";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mem-theme") : null;
    const initial = stored ? stored === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
    setDark(initial);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("mem-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);
  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}