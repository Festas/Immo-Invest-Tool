"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/tooltip";
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

export function ResultsPanel() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const isPositiveCashflow = output.cashflow.cashflowAfterTax >= 0;

  return (
    <div className="space-y-5">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Investment */}
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-900 border-indigo-200/50 dark:border-indigo-800/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide">Gesamtinvestition</span>
              <HelpTooltip content={resultHelpTexts.totalInvestment} />
            </div>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {formatCurrency(output.investmentVolume.totalInvestment)}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
              EK: {formatCurrency(currentInput.equity)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Payment */}
        <Card className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/10 to-gray-400/10 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
              <div className="p-1.5 rounded-lg bg-slate-500/10">
                <Calculator className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide">Rate/Monat</span>
              <HelpTooltip content={resultHelpTexts.monthlyRate} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(output.financing.monthlyPayment)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Darlehen: {formatCurrency(output.financing.loanAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Cashflow */}
        <Card
          className={`overflow-hidden relative ${
            isPositiveCashflow
              ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 border-emerald-200/50 dark:border-emerald-800/50"
              : "bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-red-950 dark:via-rose-950 dark:to-red-900 border-red-200/50 dark:border-red-800/50"
          }`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 ${
            isPositiveCashflow ? "bg-gradient-to-br from-emerald-400/20 to-teal-400/20" : "bg-gradient-to-br from-red-400/20 to-rose-400/20"
          }`} />
          <CardContent className="p-5 relative">
            <div
              className={`flex items-center gap-2 mb-2 ${
                isPositiveCashflow
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isPositiveCashflow ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                {isPositiveCashflow ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide">Cashflow/Monat</span>
              <HelpTooltip content={resultHelpTexts.cashflow} />
            </div>
            <p
              className={`text-2xl font-bold ${
                isPositiveCashflow
                  ? "text-emerald-900 dark:text-emerald-100"
                  : "text-red-900 dark:text-red-100"
              }`}
            >
              {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}
            </p>
            <p
              className={`text-xs mt-2 font-medium ${
                isPositiveCashflow
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              Jährlich: {formatCurrency(output.cashflow.cashflowAfterTax)}
            </p>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-100 dark:from-violet-950 dark:via-fuchsia-950 dark:to-violet-900 border-violet-200/50 dark:border-violet-800/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full -translate-y-8 translate-x-8" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <PiggyBank className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide">EK-Rendite</span>
              <HelpTooltip content={resultHelpTexts.roiEquity} />
            </div>
            <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
              {output.yields.returnOnEquity.toFixed(2)}%
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 font-medium">
              p.a. nach Steuern
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Yield Metrics */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent font-bold">
              Renditekennzahlen
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Bruttomietrendite</span>
                <HelpTooltip content={resultHelpTexts.grossYield} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{output.yields.grossRentalYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Nettomietrendite</span>
                <HelpTooltip content={resultHelpTexts.netYield} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{output.yields.netRentalYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Eigenkapitalrendite</span>
                <HelpTooltip content={resultHelpTexts.roiEquity} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{output.yields.returnOnEquity.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Cashflow-Rendite</span>
                <HelpTooltip content={resultHelpTexts.cashflowYield} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{output.yields.cashflowYield.toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-700 to-fuchsia-700 dark:from-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent font-bold">
              Steuerliche Auswirkung
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">AfA (jährlich)</span>
                <HelpTooltip content={resultHelpTexts.afaAmount} />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.tax.afaAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Absetzbare Zinsen</span>
                <HelpTooltip content={resultHelpTexts.deductibleInterest} />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.tax.deductibleInterest)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Werbungskosten gesamt</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.tax.totalDeductions)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
              <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Einkünfte aus V&V</span>
                  <HelpTooltip content={resultHelpTexts.rentalIncome} />
                </div>
                <span
                  className={`font-bold ${
                    output.tax.rentalIncomeAfterDeductions < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(output.tax.rentalIncomeAfterDeductions)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Steuereffekt (jährlich)</span>
                <HelpTooltip content={resultHelpTexts.taxEffect} />
              </div>
              <span className={`font-bold ${output.tax.taxEffect > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {output.tax.taxEffect > 0 ? "+" : ""}
                {formatCurrency(output.tax.taxEffect)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Costs Breakdown */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent font-bold">
              Nebenkostenaufschlüsselung
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Grunderwerbsteuer</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Notar & Grundbuch</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.investmentVolume.sideCosts.notaryCost)}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Makler</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.investmentVolume.sideCosts.brokerCost)}</span>
            </div>
            {output.investmentVolume.sideCosts.renovationCosts > 0 && (
              <div className="flex justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Renovierung</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(output.investmentVolume.sideCosts.renovationCosts)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
              <div className="flex justify-between py-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
                <span className="font-bold text-slate-700 dark:text-slate-300">Nebenkosten gesamt</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
