"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  mounted: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Helper to check if we're on the client
const getSnapshot = () => true;
const getServerSnapshot = () => false;
const subscribe = () => () => {};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "immocalc-theme",
}: ThemeProviderProps) {
  // Use useSyncExternalStore to track mounted state without triggering the lint rule
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Get the system theme
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Initialize state from localStorage synchronously to avoid flash
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        return storedTheme;
      }
    } catch {
      // localStorage might not be available
    }
    return defaultTheme;
  });

  // Track system theme changes for "system" mode
  const [, forceUpdate] = useState(0);

  // Calculate resolved theme based on current theme
  const resolvedTheme = useMemo((): "light" | "dark" => {
    if (theme === "system") {
      return mounted ? getSystemTheme() : "light";
    }
    return theme;
  }, [theme, getSystemTheme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-render to recalculate resolvedTheme
      forceUpdate(n => n + 1);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // localStorage might not be available
    }
  }, [storageKey]);

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  }), [theme, resolvedTheme, setTheme, mounted]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
