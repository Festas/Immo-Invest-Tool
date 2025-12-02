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
      <div className="h-10 w-[100px] rounded-xl bg-slate-100/80 dark:bg-slate-800/80 animate-pulse" />
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl",
        "text-sm font-medium transition-all duration-300",
        "bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm",
        "border border-slate-200/60 dark:border-slate-700/60",
        "hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
        "hover:border-indigo-300 dark:hover:border-indigo-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        "active:scale-[0.98] shadow-sm hover:shadow-md"
      )}
      title={`Current: ${theme}. Click to change.`}
      aria-label={`Theme: ${theme}. Click to cycle through themes.`}
    >
      <div className="relative w-5 h-5">
        {theme === "light" && (
          <Sun className="h-5 w-5 text-amber-500 animate-fade-in" />
        )}
        {theme === "dark" && (
          <Moon className="h-5 w-5 text-indigo-400 animate-fade-in" />
        )}
        {theme === "system" && (
          <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400 animate-fade-in" />
        )}
      </div>
      <span className="hidden sm:inline text-slate-700 dark:text-slate-300">
        {theme === "light" && "Hell"}
        {theme === "dark" && "Dunkel"}
        {theme === "system" && "System"}
      </span>
    </button>
  );
}
