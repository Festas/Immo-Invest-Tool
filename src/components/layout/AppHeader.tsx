"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PresetButton } from "@/components/ui/preset-selector";
import { ThemeToggle } from "@/components/theme";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn } from "@/lib/utils";
import { Calculator, RotateCcw, Eraser } from "lucide-react";

interface AppHeaderProps {
  isHeaderCollapsed: boolean;
  onClearInput: () => void;
  onResetInput: () => void;
  onLoginClick: () => void;
}

export function AppHeader({
  isHeaderCollapsed,
  onClearInput,
  onResetInput,
  onLoginClick,
}: AppHeaderProps) {
  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-50 border-b border-indigo-100/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-indigo-900/30 dark:bg-slate-900/80",
        isHeaderCollapsed ? "py-1 md:py-4" : "py-4"
      )}
    >
      <nav
        role="navigation"
        aria-label="Hauptnavigation"
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div
                className={cn(
                  "relative rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20",
                  isHeaderCollapsed ? "p-2 md:p-3" : "p-3"
                )}
              >
                <Calculator
                  className={cn(
                    "text-white transition-all duration-300",
                    isHeaderCollapsed ? "h-5 w-5 md:h-7 md:w-7" : "h-7 w-7"
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div>
              <h1
                className={cn(
                  "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text font-bold tracking-tight text-transparent transition-all duration-300 dark:from-white dark:via-indigo-100 dark:to-white",
                  isHeaderCollapsed ? "text-lg md:text-2xl" : "text-2xl"
                )}
              >
                ImmoCalc Pro
              </h1>
              <p
                className={cn(
                  "items-center gap-1.5 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400",
                  isHeaderCollapsed ? "hidden" : "hidden sm:flex"
                )}
              >
                Das All-in-One Immobilien Investment Tool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <UserMenu onLoginClick={onLoginClick} />
            <PresetButton />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearInput}
              aria-label="Alle Eingaben leeren"
              className={cn("group", isHeaderCollapsed && "h-8 px-2 md:h-9 md:px-4")}
            >
              <Eraser
                className={cn(
                  "transition-transform",
                  isHeaderCollapsed ? "h-3.5 w-3.5 md:mr-1.5 md:h-4 md:w-4" : "mr-1.5 h-4 w-4"
                )}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Leeren</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetInput}
              aria-label="Eingaben zurücksetzen"
              className={cn("group", isHeaderCollapsed && "h-8 px-2 md:h-9 md:px-4")}
            >
              <RotateCcw
                className={cn(
                  "transition-transform group-hover:rotate-180",
                  isHeaderCollapsed ? "h-3.5 w-3.5 md:mr-1.5 md:h-4 md:w-4" : "mr-1.5 h-4 w-4"
                )}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Zurücksetzen</span>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
