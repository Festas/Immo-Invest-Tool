"use client";

import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import {
  PropertyCalculatorForm,
  ResultsPanel,
  AmortizationChart,
  CumulativeCashflowChart,
  ScenarioComparison,
  PortfolioDashboard,
  RentIndexCalculator,
  BreakEvenCalculator,
  RenovationCalculator,
  ExitStrategyCalculator,
  DueDiligenceChecklist,
  LocationAnalysis,
} from "@/components";
import { useImmoCalcStore } from "@/store";
import {
  Calculator,
  BarChart3,
  GitCompare,
  LayoutDashboard,
  RotateCcw,
  MapPin,
  Target,
  Wrench,
  LogOut,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { activeTab, setActiveTab, resetInput, calculate } = useImmoCalcStore();

  // Initialize calculation on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="relative min-h-screen">
      {/* Subtle background pattern */}
      <div className="bg-pattern pointer-events-none fixed inset-0 z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="relative rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 p-3 shadow-lg transition-transform duration-300 hover:scale-105 dark:from-slate-600 dark:to-slate-700">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ImmoCalc Pro
                </h1>
                <p className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex dark:text-slate-400">
                  Das All-in-One Immobilien Investment Tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={resetInput} className="group">
                <RotateCcw className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-180" />
                <span className="hidden sm:inline">Zurücksetzen</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation - Two Rows for Better Organization */}
          <div className="mb-8 space-y-3">
            {/* Primary Tabs */}
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
              <TabsList className="inline-flex w-full sm:w-auto">
                <TabsTrigger value="calculator" className="flex items-center gap-2 px-4">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Rechner</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2 px-4">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2 px-4">
                  <GitCompare className="h-4 w-4" />
                  <span className="hidden sm:inline">Vergleich</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
              </TabsList>
            </div>
            {/* Secondary Tabs - New Features */}
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
              <TabsList className="inline-flex w-full bg-slate-100/80 sm:w-auto dark:bg-slate-800/80">
                <TabsTrigger value="rent-index" className="flex items-center gap-2 px-4">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Mietspiegel</span>
                </TabsTrigger>
                <TabsTrigger value="break-even" className="flex items-center gap-2 px-4">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Break-Even</span>
                </TabsTrigger>
                <TabsTrigger value="renovation" className="flex items-center gap-2 px-4">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Renovierung</span>
                </TabsTrigger>
                <TabsTrigger value="exit-strategy" className="flex items-center gap-2 px-4">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Exit</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex items-center gap-2 px-4">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Standort</span>
                </TabsTrigger>
                <TabsTrigger value="checklist" className="flex items-center gap-2 px-4">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Checkliste</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Input Form */}
              <div className="animate-fade-in">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg transition-transform hover:scale-105 dark:from-slate-500 dark:to-slate-600">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Eingaben
                  </h2>
                </div>
                <PropertyCalculatorForm />
              </div>

              {/* Results */}
              <div className="animate-fade-in animate-delay-200">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg transition-transform hover:scale-105 dark:from-slate-500 dark:to-slate-600">
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

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-900/70">
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
            <div className="section-divider mx-auto w-48" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Entwickelt mit ❤️ | Next.js, TypeScript, Tailwind CSS | Deutsches Steuerrecht (Stand
              2024)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
