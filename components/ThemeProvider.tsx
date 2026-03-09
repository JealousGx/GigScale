"use client";

import { useCallback, useEffect, useRef } from "react";
import { useThemeStore } from "@/lib/stores";

const STORAGE_KEY = "gigscale-theme";

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | "system" | null;
    if (stored) {
      setTheme(stored);
    }
    isInitialized.current = true;
  }, [setTheme]);

  useEffect(() => {
    applyTheme(theme);

    if (isInitialized.current) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const handleSystemChange = useCallback(
    (e: MediaQueryListEvent) => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    },
    [theme],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, [handleSystemChange]);

  return <>{children}</>;
}
