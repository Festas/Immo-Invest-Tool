"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { Onboarding } from "@/components/ui/onboarding";
import { SkipLink } from "@/components/ui/skip-link";
import { AppHeader } from "@/components/layout/AppHeader";
import { TabContent } from "@/components/layout/TabContent";
import { useImmoCalcStore } from "@/store";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    resetInput,
    clearInput,
    calculate,
    wizardMode,
    setWizardMode,
    sidebarCollapsed,
  } = useImmoCalcStore();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  // Initialize calculation on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  const handleLoginClick = () => {
    router.push("/auth");
  };

  // Handle header collapse on scroll (mobile only)
  const handleScroll = useCallback(() => {
    // Only apply on mobile screens
    if (window.innerWidth >= 768) {
      setIsHeaderCollapsed(false);
      return;
    }

    const currentScrollY = window.scrollY;

    // Collapse header when scrolling down past 50px threshold
    if (currentScrollY > 50) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down - collapse
        setIsHeaderCollapsed(true);
      } else {
        // Scrolling up - expand
        setIsHeaderCollapsed(false);
      }
    } else {
      // At top of page - always show full header
      setIsHeaderCollapsed(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen">
        {/* Skip link for keyboard navigation */}
        <SkipLink />

        {/* Onboarding flow for first-time users */}
        <Onboarding />

        {/* Subtle background pattern */}
        <div className="bg-pattern pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

        {/* Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Command Palette */}
        <CommandPalette />

        {/* Layout wrapper with dynamic margin for sidebar offset on desktop */}
        <div
          className={cn("transition-all duration-300", sidebarCollapsed ? "md:ml-16" : "md:ml-60")}
        >
          {/* Header - Collapsible on mobile */}
          <AppHeader
            isHeaderCollapsed={isHeaderCollapsed}
            onClearInput={clearInput}
            onResetInput={resetInput}
            onLoginClick={handleLoginClick}
          />

          {/* Main Content Area */}
          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "relative z-10 transition-all duration-300",
              "px-4 py-8 pb-24 sm:px-6 md:pb-8"
            )}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabContent
                wizardMode={wizardMode}
                onToggleWizardMode={() => setWizardMode(!wizardMode)}
              />
            </Tabs>
          </main>

          {/* Footer */}
          <footer
            className={cn(
              "relative z-10 mt-auto mb-[70px] border-t border-indigo-100/50 bg-gradient-to-b from-white/70 to-indigo-50/30 backdrop-blur-xl transition-all duration-300 md:mb-0 dark:border-indigo-900/30 dark:from-slate-900/70 dark:to-indigo-950/20"
            )}
          >
            <div className="px-4 py-6 sm:px-6">
              <div className="space-y-3 text-center">
                <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-700 backdrop-blur-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50">
                    ⚠️ Hinweis
                  </span>
                  <span>
                    Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle
                    Finanzberatung.
                  </span>
                </p>
                <div className="mx-auto h-px w-48 bg-gradient-to-r from-transparent via-indigo-300 to-transparent dark:via-indigo-700" />
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Entwickelt mit ❤️ | Next.js, TypeScript, Tailwind CSS | Deutsches Steuerrecht
                  (Stand 2024)
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ToastProvider>
  );
}
