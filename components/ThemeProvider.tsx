"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const stored = localStorage.getItem("gigscale-theme") as "light" | "dark" | "system" | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  useEffect(() => {
    localStorage.setItem("gigscale-theme", theme);

    const root = document.documentElement;
    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  return <>{children}</>;
}
