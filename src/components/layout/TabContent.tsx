"use client";

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { FeatureErrorBoundary } from "@/components/ui/error-boundary";
import { PropertyCalculatorForm, PropertyWizard, ResultsPanel, SmartTips } from "@/components";
import { Calculator, BarChart3, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImmoCalcStore } from "@/store";
import {
  AmortizationChart,
  CumulativeCashflowChart,
  CashflowDevelopmentChart,
  InterestPrincipalChart,
  EquityBuildupChart,
  ScenarioComparison,
  PortfolioDashboard,
  RentIndexCalculator,
  BreakEvenCalculator,
  RenovationCalculator,
  ExitStrategyCalculator,
  LocationAnalysis,
  DueDiligenceChecklist,
} from "@/components/lazy";

interface TabContentProps {
  wizardMode: boolean;
  onToggleWizardMode: () => void;
}

export function TabContent({ wizardMode, onToggleWizardMode }: TabContentProps) {
  const { loadSampleProperty } = useImmoCalcStore();
  return (
    <>
      {/* Calculator Tab */}
      <TabsContent value="calculator">
        <FeatureErrorBoundary featureName="Rechner">
          {/* Mode Toggle */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {wizardMode ? "Wizard-Modus" : "Experten-Modus"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {wizardMode
                  ? "Schritt für Schritt zur Immobilienbewertung"
                  : "Alle Eingabefelder auf einen Blick"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadSampleProperty}
                className="gap-2"
                aria-label="Beispiel-Immobilie laden"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Beispiel laden</span>
                <span className="sm:hidden">Beispiel</span>
              </Button>
              <Button
                variant={wizardMode ? "outline" : "default"}
                onClick={onToggleWizardMode}
                className="gap-2"
                aria-label={wizardMode ? "Zu Experten-Modus wechseln" : "Zu Wizard-Modus wechseln"}
              >
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                {wizardMode ? "Experten-Modus" : "Wizard-Modus"}
              </Button>
            </div>
          </div>

          {wizardMode ? (
            /* Wizard Mode */
            <PropertyWizard />
          ) : (
            /* Expert Mode - Original Form */
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
          )}
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Charts Tab */}
      <TabsContent value="charts">
        <FeatureErrorBoundary featureName="Charts">
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 dark:from-slate-800/50 dark:to-slate-800/30">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                📊 Tilgungsanalyse
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Umfassende Analyse der Kredittilgung bis zur vollständigen Rückzahlung
              </p>
            </div>
            <AmortizationChart />
            <InterestPrincipalChart />

            <div className="rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 dark:from-slate-800/50 dark:to-slate-800/30">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                💰 Cashflow-Analyse
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dynamische Entwicklung des monatlichen Cashflows über die Jahre
              </p>
            </div>
            <CashflowDevelopmentChart />

            <div className="rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 dark:from-slate-800/50 dark:to-slate-800/30">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                📈 Vermögensaufbau
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gesamtvermögensentwicklung durch Tilgung, Wertsteigerung und Cashflow
              </p>
            </div>
            <EquityBuildupChart />
            <CumulativeCashflowChart />
          </div>
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Comparison Tab */}
      <TabsContent value="comparison">
        <FeatureErrorBoundary featureName="Vergleich">
          <ScenarioComparison />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Dashboard Tab */}
      <TabsContent value="dashboard">
        <FeatureErrorBoundary featureName="Dashboard">
          <PortfolioDashboard />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Rent Index Tab */}
      <TabsContent value="rent-index">
        <FeatureErrorBoundary featureName="Mietspiegel">
          <RentIndexCalculator />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Break-Even Tab */}
      <TabsContent value="break-even">
        <FeatureErrorBoundary featureName="Break-Even">
          <BreakEvenCalculator />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Renovation Tab */}
      <TabsContent value="renovation">
        <FeatureErrorBoundary featureName="Renovierung">
          <RenovationCalculator />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Exit Strategy Tab */}
      <TabsContent value="exit-strategy">
        <FeatureErrorBoundary featureName="Exit-Strategie">
          <ExitStrategyCalculator />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Location Analysis Tab */}
      <TabsContent value="location">
        <FeatureErrorBoundary featureName="Standortanalyse">
          <LocationAnalysis />
        </FeatureErrorBoundary>
      </TabsContent>

      {/* Due Diligence Checklist Tab */}
      <TabsContent value="checklist">
        <FeatureErrorBoundary featureName="Checkliste">
          <DueDiligenceChecklist />
        </FeatureErrorBoundary>
      </TabsContent>
    </>
  );
}
