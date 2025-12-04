"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/tooltip";
import { AnimatedCurrency, AnimatedPercentage } from "@/components/ui/animated-number";
import { ProgressIndicator } from "@/components/ui/trend-indicator";
import { useImmoCalcStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { calculatePropertyKPIs } from "@/lib/calculations";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Calculator,
  Sparkles,
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

export function ResultsPanel() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const isPositiveCashflow = output.cashflow.cashflowAfterTax >= 0;

  return (
    <div className="space-y-5">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Investment */}
        <Card
          className="group relative overflow-hidden border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30"
          hover={false}
        >
          <CardContent className="relative p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">
                Gesamtinvestition
              </span>
              <HelpTooltip content={resultHelpTexts.totalInvestment} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCurrency value={output.investmentVolume.totalInvestment} />
            </p>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              EK: {formatCurrency(currentInput.equity)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Payment */}
        <Card
          className="group relative overflow-hidden border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30"
          hover={false}
        >
          <CardContent className="relative p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <Calculator className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">Rate/Monat</span>
              <HelpTooltip content={resultHelpTexts.monthlyRate} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedCurrency value={output.financing.monthlyPayment} />
            </p>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              Darlehen: {formatCurrency(output.financing.loanAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Cashflow */}
        <Card
          className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
            isPositiveCashflow
              ? "border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:border-green-700 dark:from-green-900/30 dark:to-green-900/20"
              : "border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:border-red-700 dark:from-red-900/30 dark:to-red-900/20"
          }`}
          hover={false}
        >
          <CardContent className="relative p-5">
            <div
              className={`mb-2 flex items-center gap-2 ${
                isPositiveCashflow
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <div
                className={`rounded-lg p-1.5 transition-transform group-hover:scale-110 ${isPositiveCashflow ? "bg-green-500/10" : "bg-red-500/10"}`}
              >
                {isPositiveCashflow ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">Cashflow/Monat</span>
              <HelpTooltip content={resultHelpTexts.cashflow} />
            </div>
            <p
              className={`text-2xl font-bold ${
                isPositiveCashflow
                  ? "text-green-900 dark:text-green-100"
                  : "text-red-900 dark:text-red-100"
              }`}
            >
              <AnimatedCurrency value={output.cashflow.monthlyCashflowAfterTax} />
            </p>
            <p
              className={`mt-2 text-xs font-medium ${
                isPositiveCashflow
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              Jährlich: {formatCurrency(output.cashflow.cashflowAfterTax)}
            </p>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card
          className="group relative overflow-hidden border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30"
          hover={false}
        >
          <CardContent className="relative p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="rounded-lg bg-slate-500/10 p-1.5 transition-transform group-hover:scale-110">
                <PiggyBank className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase">EK-Rendite</span>
              <HelpTooltip content={resultHelpTexts.roiEquity} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              <AnimatedPercentage value={output.yields.returnOnEquity} />
            </p>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              p.a. nach Steuern
            </p>
            {/* Progress bar for yield */}
            <div className="mt-3">
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

      {/* Yield Metrics */}
      <Card className="overflow-hidden" animate>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-3 dark:from-slate-800/50 dark:to-slate-800/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Renditekennzahlen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <div className="group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Bruttomietrendite
                </span>
                <HelpTooltip content={resultHelpTexts.grossYield} />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.grossRentalYield} />
              </span>
            </div>
            <div className="group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Nettomietrendite
                </span>
                <HelpTooltip content={resultHelpTexts.netYield} />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.netRentalYield} />
              </span>
            </div>
            <div className="group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Eigenkapitalrendite
                </span>
                <HelpTooltip content={resultHelpTexts.roiEquity} />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.returnOnEquity} />
              </span>
            </div>
            <div className="group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Cashflow-Rendite
                </span>
                <HelpTooltip content={resultHelpTexts.cashflowYield} />
              </div>
              <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                <AnimatedPercentage value={output.yields.cashflowYield} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Overview */}
      <Card className="overflow-hidden" animate>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-3 dark:from-slate-800/50 dark:to-slate-800/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Steuerliche Auswirkung</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  AfA (jährlich)
                </span>
                <HelpTooltip content={resultHelpTexts.afaAmount} />
              </div>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.tax.afaAmount)}
              </span>
            </div>
            <div className="group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Absetzbare Zinsen
                </span>
                <HelpTooltip content={resultHelpTexts.deductibleInterest} />
              </div>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.tax.deductibleInterest)}
              </span>
            </div>
            <div className="group flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Werbungskosten gesamt
              </span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.tax.totalDeductions)}
              </span>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-2 dark:from-slate-800/50 dark:to-slate-800/30">
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
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-2 dark:from-slate-800/50 dark:to-slate-800/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Steuereffekt (jährlich)
                </span>
                <HelpTooltip content={resultHelpTexts.taxEffect} />
              </div>
              <span
                className={`font-bold tabular-nums ${output.tax.taxEffect > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {output.tax.taxEffect > 0 ? "+" : ""}
                {formatCurrency(output.tax.taxEffect)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Costs Breakdown */}
      <Card className="overflow-hidden" animate>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-3 dark:from-slate-800/50 dark:to-slate-800/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              Nebenkostenaufschlüsselung
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="group flex justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Grunderwerbsteuer
              </span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)}
              </span>
            </div>
            <div className="group flex justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Notar & Grundbuch
              </span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.investmentVolume.sideCosts.notaryCost)}
              </span>
            </div>
            <div className="group flex justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
              <span className="font-medium text-slate-600 dark:text-slate-400">Makler</span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(output.investmentVolume.sideCosts.brokerCost)}
              </span>
            </div>
            {output.investmentVolume.sideCosts.renovationCosts > 0 && (
              <div className="group flex justify-between rounded-xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800/50">
                <span className="font-medium text-slate-600 dark:text-slate-400">Renovierung</span>
                <span className="font-semibold text-slate-900 tabular-nums dark:text-white">
                  {formatCurrency(output.investmentVolume.sideCosts.renovationCosts)}
                </span>
              </div>
            )}
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 px-3 py-2 dark:from-slate-800/50 dark:to-slate-800/30">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Nebenkosten gesamt
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                    {formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    ({output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
