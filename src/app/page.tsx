"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ToastProvider } from "@/components/ui/toast";
import { Onboarding } from "@/components/ui/onboarding";
import { PresetButton } from "@/components/ui/preset-selector";
import { SkipLink } from "@/components/ui/skip-link";
import { ThemeToggle } from "@/components/theme";
import { PropertyCalculatorForm, ResultsPanel, SmartTips } from "@/components";
import { ChartSkeleton, DashboardSkeleton, CalculatorSkeleton } from "@/components/skeletons";
import { useImmoCalcStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Calculator,
  BarChart3,
  GitCompare,
  LayoutDashboard,
  RotateCcw,
  Eraser,
  MapPin,
  Target,
  Wrench,
  LogOut,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";

// Lazy load heavy components for better performance
const AmortizationChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.AmortizationChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const CumulativeCashflowChart = dynamic(
  () => import("@/components/Charts").then((mod) => ({ default: mod.CumulativeCashflowChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const ScenarioComparison = dynamic(
  () =>
    import("@/components/ScenarioComparison").then((mod) => ({ default: mod.ScenarioComparison })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

const PortfolioDashboard = dynamic(
  () =>
    import("@/components/PortfolioDashboard").then((mod) => ({ default: mod.PortfolioDashboard })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

const RentIndexCalculator = dynamic(
  () =>
    import("@/components/RentIndexCalculator").then((mod) => ({
      default: mod.RentIndexCalculator,
    })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

const BreakEvenCalculator = dynamic(
  () =>
    import("@/components/BreakEvenCalculator").then((mod) => ({
      default: mod.BreakEvenCalculator,
    })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

const RenovationCalculator = dynamic(
  () =>
    import("@/components/RenovationCalculator").then((mod) => ({
      default: mod.RenovationCalculator,
    })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

const ExitStrategyCalculator = dynamic(
  () =>
    import("@/components/ExitStrategyCalculator").then((mod) => ({
      default: mod.ExitStrategyCalculator,
    })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

const LocationAnalysis = dynamic(
  () => import("@/components/LocationAnalysis").then((mod) => ({ default: mod.LocationAnalysis })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

const DueDiligenceChecklist = dynamic(
  () =>
    import("@/components/DueDiligenceChecklist").then((mod) => ({
      default: mod.DueDiligenceChecklist,
    })),
  {
    loading: () => <CalculatorSkeleton />,
    ssr: false,
  }
);

export default function Home() {
  const { activeTab, setActiveTab, resetInput, clearInput, calculate } = useImmoCalcStore();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Initialize calculation on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

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

        {/* Header - Collapsible on mobile */}
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
                <PresetButton />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearInput}
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
                  onClick={resetInput}
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

        {/* Main Content - Add bottom padding on mobile for bottom nav */}
        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:pb-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation - Hidden on mobile, visible on md and above */}
            <div className="mb-8 hidden space-y-3 md:block" data-onboarding="tabs">
              {/* Primary Tabs */}
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
                <TabsList className="inline-flex w-full sm:w-auto" aria-label="Hauptfunktionen">
                  <TabsTrigger value="calculator" className="flex items-center gap-2 px-4">
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Rechner</span>
                    <span className="sr-only sm:hidden">Rechner</span>
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2 px-4">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Charts</span>
                    <span className="sr-only sm:hidden">Charts</span>
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="flex items-center gap-2 px-4">
                    <GitCompare className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Vergleich</span>
                    <span className="sr-only sm:hidden">Vergleich</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sr-only sm:hidden">Dashboard</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* Secondary Tabs - New Features */}
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
                <TabsList
                  className="inline-flex w-full bg-slate-100/80 sm:w-auto dark:bg-slate-800/80"
                  aria-label="Weitere Funktionen"
                >
                  <TabsTrigger value="rent-index" className="flex items-center gap-2 px-4">
                    <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Mietspiegel</span>
                    <span className="sr-only sm:hidden">Mietspiegel</span>
                  </TabsTrigger>
                  <TabsTrigger value="break-even" className="flex items-center gap-2 px-4">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Break-Even</span>
                    <span className="sr-only sm:hidden">Break-Even</span>
                  </TabsTrigger>
                  <TabsTrigger value="renovation" className="flex items-center gap-2 px-4">
                    <Wrench className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Renovierung</span>
                    <span className="sr-only sm:hidden">Renovierung</span>
                  </TabsTrigger>
                  <TabsTrigger value="exit-strategy" className="flex items-center gap-2 px-4">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Exit</span>
                    <span className="sr-only sm:hidden">Exit</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center gap-2 px-4">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Standort</span>
                    <span className="sr-only sm:hidden">Standort</span>
                  </TabsTrigger>
                  <TabsTrigger value="checklist" className="flex items-center gap-2 px-4">
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Checkliste</span>
                    <span className="sr-only sm:hidden">Checkliste</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Calculator Tab */}
            <TabsContent value="calculator">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                {/* Input Form */}
                <div className="animate-fade-in" data-onboarding="form">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Eingaben
                    </h2>
                  </div>
                  <PropertyCalculatorForm />
                  {/* Smart Tips - Show contextual guidance */}
                  <div className="mt-6">
                    <SmartTips />
                  </div>
                </div>

                {/* Results */}
                <div className="animate-fade-in animate-delay-200" data-onboarding="results">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Ergebnisse
                    </h2>
                  </div>
                  <ResultsPanel />
                </div>
              </div>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts">
              <div className="space-y-6">
                <AmortizationChart />
                <CumulativeCashflowChart />
              </div>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison">
              <ScenarioComparison />
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <PortfolioDashboard />
            </TabsContent>

            {/* Rent Index Tab */}
            <TabsContent value="rent-index">
              <RentIndexCalculator />
            </TabsContent>

            {/* Break-Even Tab */}
            <TabsContent value="break-even">
              <BreakEvenCalculator />
            </TabsContent>

            {/* Renovation Tab */}
            <TabsContent value="renovation">
              <RenovationCalculator />
            </TabsContent>

            {/* Exit Strategy Tab */}
            <TabsContent value="exit-strategy">
              <ExitStrategyCalculator />
            </TabsContent>

            {/* Location Analysis Tab */}
            <TabsContent value="location">
              <LocationAnalysis />
            </TabsContent>

            {/* Due Diligence Checklist Tab */}
            <TabsContent value="checklist">
              <DueDiligenceChecklist />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer - Add extra bottom margin on mobile to account for bottom nav */}
        <footer className="relative z-10 mt-auto mb-[70px] border-t border-indigo-100/50 bg-gradient-to-b from-white/70 to-indigo-50/30 backdrop-blur-xl transition-all duration-300 md:mb-0 dark:border-indigo-900/30 dark:from-slate-900/70 dark:to-indigo-950/20">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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
                Entwickelt mit ❤️ | Next.js, TypeScript, Tailwind CSS | Deutsches Steuerrecht (Stand
                2024)
              </p>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ToastProvider>
  );
}
