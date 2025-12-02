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
  Sparkles,
} from "lucide-react";

export default function Home() {
  const { activeTab, setActiveTab, resetInput, calculate } = useImmoCalcStore();

  // Initialize calculation on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                  ImmoCalc Pro
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Das All-in-One Immobilien Investment Tool
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={resetInput}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Zurücksetzen</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation - Two Rows for Better Organization */}
          <div className="mb-8 space-y-3">
            {/* Primary Tabs */}
            <div className="overflow-x-auto pb-1 -mx-4 px-4">
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
            <div className="overflow-x-auto pb-1 -mx-4 px-4">
              <TabsList className="inline-flex w-full sm:w-auto bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Eingaben
                  </h2>
                </div>
                <PropertyCalculatorForm />
              </div>

              {/* Results */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Ergebnisse
                  </h2>
                </div>
                <ResultsPanel />
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts">
            <div className="space-y-8">
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
      <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                ⚠️ Hinweis
              </span>
              Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung.
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Entwickelt mit ❤️ | Next.js, TypeScript, Tailwind CSS | Deutsches Steuerrecht (Stand 2024)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
