"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/tooltip";
import { AnimatedCurrency, AnimatedPercentage } from "@/components/ui/animated-number";
import { ProgressIndicator } from "@/components/ui/trend-indicator";
import { Gauge } from "@/components/ui/gauge";
import { SwipeableCards } from "@/components/ui/swipeable-cards";
import { useImmoCalcStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { calculatePropertyKPIs } from "@/lib/calculations";
import { PropertyOutput } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Calculator,
  Sparkles,
  FileText,
  Receipt,
  Landmark,
  Percent,
} from "lucide-react";

// Help texts for results
const resultHelpTexts = {
  totalInvestment: `Gesamtinvestition = Kaufpreis + alle Nebenkosten.

📊 Berechnung:
Kaufpreis + Grunderwerbsteuer + Notar + Makler + Renovierung

Dies ist die Summe, die Sie für den Erwerb der Immobilie aufbringen müssen.`,

  monthlyRate: `Monatliche Darlehensrate (Annuität).

📊 Berechnung:
Rate = Darlehenssumme × (Zinssatz + Tilgung) / 12

Die Rate bleibt während der Zinsbindung konstant. Der Zinsanteil sinkt, der Tilgungsanteil steigt.`,

  cashflow: `Monatlicher Cashflow nach Steuern.

📊 Berechnung:
Mieteinnahmen - Betriebskosten - Darlehensrate + Steuerersparnis

✅ Positiv = Sie haben monatlichen Überschuss
❌ Negativ = Sie müssen monatlich zuschießen`,

  roiEquity: `Eigenkapitalrendite (Return on Equity).

📊 Berechnung:
EK-Rendite = Jährlicher Cashflow / Eigenkapital × 100

Dies zeigt, wie gut sich Ihr eingesetztes Kapital verzinst. Durch den Hebeleffekt oft höher als die Mietrendite.`,

  grossYield: `Bruttomietrendite = Jahresmiete / Kaufpreis × 100

📊 Einfache Kennzahl ohne Nebenkosten.

💡 Richtwerte:
• Ab 4% interessant
• Ab 5% gut
• Ab 6% sehr gut`,

  netYield: `Nettomietrendite berücksichtigt alle Kosten.

📊 Berechnung:
(Jahresmiete - Betriebskosten) / Gesamtinvestition × 100

Aussagekräftiger als die Bruttomietrendite.`,

  cashflowYield: `Cashflow-Rendite = Cashflow / Gesamtinvestition × 100

Zeigt die tatsächliche Rendite auf Ihr gesamtes eingesetztes Kapital inkl. Finanzierungskosten.`,

  afaAmount: `AfA (Absetzung für Abnutzung) - jährliche Gebäudeabschreibung.

📊 Berechnung:
Kaufpreis × Gebäudeanteil × AfA-Satz

Dies ist ein steuerlicher Vorteil, da Sie die AfA von Ihren Mieteinnahmen abziehen können.`,

  deductibleInterest: `Steuerlich absetzbare Darlehenszinsen.

Die Zinsen sind Werbungskosten und mindern Ihre steuerlichen Einkünfte aus Vermietung.`,

  taxEffect: `Jährliche Steuerersparnis oder -belastung.

📊 Berechnung:
Zu versteuerndes Einkommen × Persönlicher Steuersatz

✅ Positiv = Steuerersparnis (Verluste werden mit anderen Einkünften verrechnet)
❌ Negativ = Steuerlast auf Mietgewinn`,

  rentalIncome: `Einkünfte aus Vermietung und Verpachtung.

📊 Berechnung:
Mieteinnahmen - Werbungskosten (AfA, Zinsen, Betriebskosten)

❌ Negativ = Steuerlicher Verlust (wird mit anderen Einkünften verrechnet)
✅ Positiv = Zu versteuernder Gewinn`,
};

/** Maximum expected ROE percentage for progress bar visualization */
const MAX_ROE_FOR_PROGRESS = 20;

// Extracted sub-components defined outside the main component
interface YieldMetricsContentProps {
  output: PropertyOutput;
}

function YieldMetricsContent({ output }: YieldMetricsContentProps) {
  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 pb-3 dark:from-indigo-950/30 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Renditekennzahlen</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* EK-Rendite Gauge */}
        <div className="mb-4 flex justify-center">
          <Gauge
            value={output.yields.returnOnEquity}
            max={MAX_ROE_FOR_PROGRESS}
            size="md"
            label="EK-Rendite"
          />
        </div>

        <div className="space-y-1">
          <div className="group flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Bruttomietrendite
              </span>
              <HelpTooltip content={resultHelpTexts.grossYield} />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-20 sm:block">
                <ProgressIndicator
                  value={Math.min(output.yields.grossRentalYield, 10)}
                  max={10}
                  showLabel={false}
                  size="sm"
                />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.grossRentalYield} />
              </span>
            </div>
          </div>
          <div className="group flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Nettomietrendite
              </span>
              <HelpTooltip content={resultHelpTexts.netYield} />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-20 sm:block">
                <ProgressIndicator
                  value={Math.min(output.yields.netRentalYield, 10)}
                  max={10}
                  showLabel={false}
                  size="sm"
                />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.netRentalYield} />
              </span>
            </div>
          </div>
          <div className="group flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Eigenkapitalrendite
              </span>
              <HelpTooltip content={resultHelpTexts.roiEquity} />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-20 sm:block">
                <ProgressIndicator
                  value={Math.min(output.yields.returnOnEquity, MAX_ROE_FOR_PROGRESS)}
                  max={MAX_ROE_FOR_PROGRESS}
                  showLabel={false}
                  size="sm"
                />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.returnOnEquity} />
              </span>
            </div>
          </div>
          <div className="group flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Cashflow-Rendite
              </span>
              <HelpTooltip content={resultHelpTexts.cashflowYield} />
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden w-20 sm:block">
                <ProgressIndicator
                  value={Math.min(Math.max(output.yields.cashflowYield, 0), 10)}
                  max={10}
                  showLabel={false}
                  size="sm"
                />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.cashflowYield} />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TaxOverviewContentProps {
  output: PropertyOutput;
  isTaxSaving: boolean;
}

function TaxOverviewContent({ output, isTaxSaving }: TaxOverviewContentProps) {
  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 pb-3 dark:from-indigo-950/30 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Steuerliche Auswirkung</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Tax summary mini card */}
        <div
          className={`mb-4 rounded-lg p-3 text-center ${
            isTaxSaving ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              isTaxSaving ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            }`}
          >
            {isTaxSaving ? "💰 Sie sparen" : "📊 Steuerlast:"}{" "}
            <span className="font-bold">{formatCurrency(Math.abs(output.tax.taxEffect))}</span> pro
            Jahr
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="group flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-400">AfA (jährlich)</span>
              <HelpTooltip content={resultHelpTexts.afaAmount} />
            </div>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.tax.afaAmount)}
            </span>
          </div>
          <div className="group flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Absetzbare Zinsen
              </span>
              <HelpTooltip content={resultHelpTexts.deductibleInterest} />
            </div>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.tax.deductibleInterest)}
            </span>
          </div>
          <div className="group flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Werbungskosten gesamt
              </span>
            </div>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.tax.totalDeductions)}
            </span>
          </div>
          <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-indigo-900/30">
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50/50 to-slate-50 px-3 py-2 dark:from-indigo-950/30 dark:to-slate-800/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Einkünfte aus V&V
                </span>
                <HelpTooltip content={resultHelpTexts.rentalIncome} />
              </div>
              <span
                className={`font-bold tabular-nums ${
                  output.tax.rentalIncomeAfterDeductions < 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(output.tax.rentalIncomeAfterDeductions)}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              isTaxSaving ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  isTaxSaving
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                Steuereffekt (jährlich)
              </span>
              <HelpTooltip content={resultHelpTexts.taxEffect} />
            </div>
            <span
              className={`font-bold tabular-nums ${
                isTaxSaving
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {output.tax.taxEffect > 0 ? "+" : ""}
              {formatCurrency(output.tax.taxEffect)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SideCostsContentProps {
  output: PropertyOutput;
}

function SideCostsContent({ output }: SideCostsContentProps) {
  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 pb-3 dark:from-indigo-950/30 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Nebenkostenaufschlüsselung
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm">
          <div className="group flex justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Grunderwerbsteuer
            </span>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)}
            </span>
          </div>
          <div className="group flex justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Notar & Grundbuch
            </span>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.investmentVolume.sideCosts.notaryCost)}
            </span>
          </div>
          <div className="group flex justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
            <span className="font-medium text-slate-600 dark:text-slate-400">Makler</span>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
              {formatCurrency(output.investmentVolume.sideCosts.brokerCost)}
            </span>
          </div>
          {output.investmentVolume.sideCosts.renovationCosts > 0 && (
            <div className="group flex justify-between rounded-lg px-3 py-2 transition-all duration-200 hover:bg-indigo-50/50 hover:shadow-sm dark:hover:bg-indigo-950/30">
              <span className="font-medium text-slate-600 dark:text-slate-400">Renovierung</span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.investmentVolume.sideCosts.renovationCosts)}
              </span>
            </div>
          )}
          <div className="mt-3 border-t border-indigo-100 pt-3 dark:border-indigo-900/30">
            <div className="flex justify-between rounded-lg bg-gradient-to-r from-indigo-50/50 to-slate-50 px-3 py-2 dark:from-indigo-950/30 dark:to-slate-800/30">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Nebenkosten gesamt
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                  {formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)}
                </span>
                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                  ({output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable class strings for better maintainability
const secondaryMetricCardClasses =
  "group relative min-w-[200px] flex-shrink-0 overflow-hidden border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:min-w-0 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30";

const secondaryMetricsRowClasses =
  "scrollbar-hide -mx-2 flex gap-4 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0";

export function ResultsPanel() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const isPositiveCashflow = output.cashflow.cashflowAfterTax >= 0;
  const isTaxSaving = output.tax.taxEffect > 0;

  return (
    <div className="space-y-6" aria-live="polite" aria-atomic="true">
      {/* Screen reader announcement for calculation updates */}
      <div className="sr-only" role="status">
        Berechnung aktualisiert: Monatlicher Cashflow{" "}
        {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}.
        {isPositiveCashflow ? " Cashflow ist positiv." : " Cashflow ist negativ."}
        Eigenkapitalrendite: {output.yields.returnOnEquity.toFixed(1)} Prozent pro Jahr.
      </div>

      {/* Hero Cashflow Card - Full Width */}
      <Card
        className={`overflow-hidden transition-all duration-300 ${
          isPositiveCashflow
            ? "animate-cashflow-glow border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/20"
            : "border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-700 dark:from-red-900/30 dark:to-red-900/20"
        }`}
        hover={false}
      >
        <CardContent className="p-6 text-center">
          <div
            role="status"
            className={`mb-2 flex items-center justify-center gap-2 ${
              isPositiveCashflow
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {isPositiveCashflow ? (
              <TrendingUp className="animate-bounce-subtle h-8 w-8" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-8 w-8" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold tracking-wide uppercase">
              Monatlicher Cashflow
            </span>
            <HelpTooltip content={resultHelpTexts.cashflow} />
          </div>
          <p
            className={`text-4xl font-bold md:text-5xl ${
              isPositiveCashflow
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100"
            }`}
          >
            <AnimatedCurrency value={output.cashflow.monthlyCashflowAfterTax} />
          </p>
          <p
            className={`mt-2 text-lg ${
              isPositiveCashflow
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {formatCurrency(output.cashflow.cashflowAfterTax)} pro Jahr
          </p>
          <p
            className={`mt-3 text-sm ${
              isPositiveCashflow
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isPositiveCashflow
              ? "✅ Positiver Cashflow – Ihre Immobilie trägt sich selbst"
              : "⚠️ Negativer Cashflow – Monatlicher Zuschuss nötig"}
          </p>
        </CardContent>
      </Card>

      {/* Secondary Metrics Row - Horizontal scrollable on mobile, 3-column grid on desktop */}
      <div className={secondaryMetricsRowClasses}>
        {/* Total Investment */}
        <Card className={secondaryMetricCardClasses} hover={false}>
          <CardContent className="relative p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">
                Gesamtinvestition
              </span>
              <HelpTooltip content={resultHelpTexts.totalInvestment} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCurrency value={output.investmentVolume.totalInvestment} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              EK: {formatCurrency(currentInput.equity)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Payment */}
        <Card className={secondaryMetricCardClasses} hover={false}>
          <CardContent className="relative p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <Calculator className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">Rate/Monat</span>
              <HelpTooltip content={resultHelpTexts.monthlyRate} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCurrency value={output.financing.monthlyPayment} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Darlehen: {formatCurrency(output.financing.loanAmount)}
            </p>
          </CardContent>
        </Card>

        {/* ROI with Progress */}
        <Card className={secondaryMetricCardClasses} hover={false}>
          <CardContent className="relative p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <PiggyBank className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">EK-Rendite</span>
              <HelpTooltip content={resultHelpTexts.roiEquity} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedPercentage value={output.yields.returnOnEquity} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              p.a. nach Steuern
            </p>
            {/* Progress bar for yield */}
            <div className="mt-2">
              <ProgressIndicator
                value={Math.min(output.yields.returnOnEquity, MAX_ROE_FOR_PROGRESS)}
                max={MAX_ROE_FOR_PROGRESS}
                showLabel={false}
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swipeable Cards for Mobile */}
      <div className="md:hidden">
        <SwipeableCards showArrows={true} showDots={true}>
          <YieldMetricsContent output={output} />
          <TaxOverviewContent output={output} isTaxSaving={isTaxSaving} />
          <SideCostsContent output={output} />
        </SwipeableCards>
      </div>

      {/* Desktop: Stacked Layout */}
      <div className="hidden space-y-6 md:block">
        <YieldMetricsContent output={output} />
        <TaxOverviewContent output={output} isTaxSaving={isTaxSaving} />
        <SideCostsContent output={output} />
      </div>
    </div>
  );
}
