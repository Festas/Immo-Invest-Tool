"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="h-10 w-[100px] animate-pulse rounded-xl bg-slate-100/80 dark:bg-slate-800/80" />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "relative inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4",
        "text-sm font-medium transition-all duration-300",
        "bg-slate-100/80 backdrop-blur-sm dark:bg-slate-800/80",
        "border border-slate-200/60 dark:border-slate-700/60",
        "hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
        "hover:border-indigo-300 dark:hover:border-indigo-600",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        "shadow-sm hover:shadow-md active:scale-[0.98]"
      )}
      title={`Current: ${theme}. Click to change.`}
      aria-label={`Theme: ${theme}. Click to cycle through themes.`}
    >
      <div className="relative h-5 w-5">
        {theme === "light" && <Sun className="animate-fade-in h-5 w-5 text-amber-500" />}
        {theme === "dark" && <Moon className="animate-fade-in h-5 w-5 text-indigo-400" />}
        {theme === "system" && (
          <Monitor className="animate-fade-in h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </div>
      <span className="hidden text-slate-700 sm:inline dark:text-slate-300">
        {theme === "light" && "Hell"}
        {theme === "dark" && "Dunkel"}
        {theme === "system" && "System"}
      </span>
    </button>
  );
}
