"use client";

import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  PropertyCalculatorForm,
  ResultsPanel,
  AmortizationChart,
  CumulativeCashflowChart,
  ScenarioComparison,
  PortfolioDashboard,
} from "@/components";
import { useImmoCalcStore } from "@/store";
import { Calculator, BarChart3, GitCompare, LayoutDashboard, RotateCcw } from "lucide-react";

export default function Home() {
  const { activeTab, setActiveTab, resetInput, calculate } = useImmoCalcStore();

  // Initialize calculation on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ImmoCalc Pro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Professionelle Immobilienkalkulation
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetInput}>
              <RotateCcw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Zurücksetzen</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex w-full sm:w-auto">
              <TabsTrigger value="calculator" className="flex items-center gap-1 px-3">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Rechner</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-1 px-3">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1 px-3">
                <GitCompare className="h-4 w-4" />
                <span className="hidden sm:inline">Vergleich</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-1 px-3">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Eingaben
                </h2>
                <PropertyCalculatorForm />
              </div>

              {/* Results */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Ergebnisse
                </h2>
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
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              ⚠️ Dieses Tool dient nur zu Informationszwecken und ersetzt keine professionelle
              Finanzberatung.
            </p>
            <p className="mt-1">
              Entwickelt mit ❤️ | Next.js, TypeScript, Tailwind CSS | Deutsches Steuerrecht (Stand
              2024)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
