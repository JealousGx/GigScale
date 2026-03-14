"use client";

import { useCallback, useEffect, useRef } from "react";

import { setThemeCookie as setThemeCookieAction } from "@/lib/actions/theme";
import { useThemeStore } from "@/lib/stores";

const STORAGE_KEY = "gigscale-theme";

function getResolvedTheme(theme: "light" | "dark" | "system"): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const resolved = getResolvedTheme(theme);
  root.classList.toggle("dark", resolved === "dark");
  void setThemeCookieAction(resolved);
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
        void setThemeCookieAction(e.matches ? "dark" : "light");
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
