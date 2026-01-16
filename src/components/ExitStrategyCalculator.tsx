"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useImmoCalcStore } from "@/store";
import { calculateExitStrategy, calculatePropertyKPIs } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { ExitStrategyResult } from "@/types";
import {
  LogOut,
  Calculator,
  AlertTriangle,
  TrendingUp,
  Clock,
  Wallet,
  Scale,
  PiggyBank,
} from "lucide-react";

// Help texts for exit strategy calculator
const helpTexts = {
  holdingPeriod: `Geplante Haltedauer der Immobilie in Jahren.

📍 Wichtig für die Steuern:
• Unter 10 Jahre: Spekulationssteuer fällt an!
• Ab 10 Jahre: Steuerfreier Verkauf möglich

💡 Tipp: Mindestens 10 Jahre halten für steuerfreien Gewinn.`,

  appreciation: `Erwartete jährliche Wertsteigerung der Immobilie.

📍 Historische Werte (Deutschland):
• Durchschnitt: 2-3% p.a.
• Großstädte: 3-5% p.a.
• Ländlich: 0-2% p.a.

💡 Vorsichtig kalkulieren ist besser als zu optimistisch!`,
};

export function ExitStrategyCalculator() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [appreciationRate, setAppreciationRate] = useState(2.0);
  const [result, setResult] = useState<ExitStrategyResult | null>(null);

  // Use marketValue if available, otherwise use totalInvestment
  const baseValue =
    currentInput.marketValue && currentInput.marketValue > 0
      ? currentInput.marketValue
      : output.investmentVolume.totalInvestment;

  // Calculate current values based on holding period and appreciation
  const currentValue = baseValue * Math.pow(1 + appreciationRate / 100, holdingPeriod);

  // Calculate remaining debt based on amortization
  const remainingDebt =
    holdingPeriod <= output.amortizationSchedule.length
      ? output.amortizationSchedule[holdingPeriod - 1]?.endingBalance || 0
      : 0;

  // Calculate cumulative cashflow
  const cumulativeCashflow = output.cashflow.cashflowAfterTax * holdingPeriod;

  // Calculate total principal paid (Tilgung) over holding period
  const totalTilgung =
    holdingPeriod <= output.amortizationSchedule.length
      ? output.amortizationSchedule[holdingPeriod - 1]?.cumulativePrincipal || 0
      : output.amortizationSchedule[output.amortizationSchedule.length - 1]?.cumulativePrincipal ||
        0;

  const handleCalculate = () => {
    const exitResult = calculateExitStrategy({
      purchasePrice: output.investmentVolume.totalInvestment,
      currentValue: currentValue,
      marketValue: currentInput.marketValue,
      holdingPeriodYears: holdingPeriod,
      remainingDebt: remainingDebt,
      cumulativeCashflow: cumulativeCashflow,
      speculationTaxApplies: holdingPeriod < 10,
      personalTaxRate: currentInput.personalTaxRate,
      equity: currentInput.equity,
      totalTilgung: totalTilgung,
    });
    setResult(exitResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-purple-600" />
            Exit-Strategie / Verkaufsrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Planen Sie Ihren Ausstieg und berechnen Sie Ihren Gewinn beim Verkauf der Immobilie.
            Diese Analyse berücksichtigt die Spekulationssteuer und alle relevanten Kosten.
          </p>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/50">
            <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              Ausgangswerte (aus aktuellem Rechner):
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400">Gesamtinvestition:</span>
                <p className="font-semibold">
                  {formatCurrency(output.investmentVolume.totalInvestment)}
                </p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">Monatlicher Cashflow:</span>
                <p
                  className={`font-semibold ${
                    output.cashflow.monthlyCashflowAfterTax >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}
                </p>
              </div>
            </div>
          </div>

          <Slider
            label="Haltedauer"
            min={1}
            max={30}
            step={1}
            value={holdingPeriod}
            onChange={(value) => setHoldingPeriod(value)}
            formatValue={(v) => `${v} Jahre`}
            helpText={helpTexts.holdingPeriod}
          />

          {holdingPeriod < 10 && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-950/50">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Achtung:</strong> Bei einer Haltedauer unter 10 Jahren fällt
                Spekulationssteuer auf den Gewinn an!
              </p>
            </div>
          )}

          <Slider
            label="Angenommene jährliche Wertsteigerung"
            min={0}
            max={5}
            step={0.1}
            value={appreciationRate}
            onChange={(value) => setAppreciationRate(value)}
            formatValue={(v) => `${v.toFixed(1)}%`}
            helpText={helpTexts.appreciation}
          />

          {currentInput.marketValue && currentInput.marketValue > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/50">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Hinweis:</strong> Die Berechnung basiert auf dem eingegebenen Marktwert von{" "}
                {formatCurrency(currentInput.marketValue)} als Ausgangspunkt für die Wertsteigerung.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
            <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              Geschätzte Werte nach {holdingPeriod} Jahren:
            </p>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Immobilienwert:</span>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(currentValue)}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Restschuld:</span>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(remainingDebt)}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Kum. Cashflow:</span>
                <p
                  className={`font-semibold ${
                    cumulativeCashflow >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(cumulativeCashflow)}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Exit-Strategie berechnen
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-5 w-5 text-green-600" />
                Verkaufsanalyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    Bruttogewinn (Wertzuwachs)
                  </span>
                  <span
                    className={`font-semibold ${
                      result.grossProfit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.grossProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    Verkaufsnebenkosten (ca. 6%)
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(result.sellingCosts)}
                  </span>
                </div>
                {result.speculationTax > 0 && (
                  <div className="-mx-4 flex items-center justify-between border-b border-slate-100 bg-yellow-50 px-4 py-2 dark:border-slate-800 dark:bg-yellow-950/50">
                    <span className="flex items-center gap-1 text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4" />
                      Spekulationssteuer
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(result.speculationTax)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-slate-200 py-2 dark:border-slate-700">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Nettogewinn aus Verkauf
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      result.netProfit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.netProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">+ Kumulierter Cashflow</span>
                  <span
                    className={`font-semibold ${
                      cumulativeCashflow >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(cumulativeCashflow)}
                  </span>
                </div>
                <div className="-mx-4 flex items-center justify-between rounded bg-purple-50 px-4 py-3 dark:bg-purple-950/50">
                  <span className="font-bold text-purple-900 dark:text-purple-100">
                    GESAMTRENDITE
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      result.totalReturn >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.totalReturn)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-slate-200 !bg-transparent bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Jährliche Durchschnittsrendite</span>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    result.annualizedReturn >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.annualizedReturn.toFixed(2)}% p.a.
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  über {holdingPeriod} Jahre Haltedauer
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 !bg-transparent bg-green-50 dark:border-green-800 dark:bg-green-900/30">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Netto-Erlös nach Tilgung</span>
                </div>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(result.netProceedsAfterDebt)}
                </p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Auszahlungsbetrag nach Darlehenstilgung
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-purple-200 !bg-transparent bg-purple-50 dark:border-purple-700 dark:bg-purple-900/30">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Equity Multiplier</span>
                </div>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {result.equityMultiplier.toFixed(1)}x
                </p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  Aus {formatCurrency(currentInput.equity)} wurden{" "}
                  {formatCurrency(currentInput.equity + result.totalReturn)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 !bg-transparent bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Scale className="h-4 w-4" />
                  <span className="text-sm font-medium">Return on Equity</span>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    result.returnOnEquity >= 0 ? "text-blue-900 dark:text-blue-100" : "text-red-600"
                  }`}
                >
                  {result.returnOnEquity.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  ROI bezogen auf Eigenkapital
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 !bg-transparent bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <PiggyBank className="h-4 w-4" />
                  <span className="text-sm font-medium">Equity Build-up</span>
                </div>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(result.equityBuildUp)}
                </p>
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  Durch Tilgung aufgebautes Eigenkapital
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="py-4">
              <div
                className={`rounded-lg border-l-4 p-4 ${
                  result.annualizedReturn >= 5
                    ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                    : result.annualizedReturn >= 2
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                      : "border-red-500 bg-red-50 dark:bg-red-950/50"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">Empfehlung</p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {result.recommendation}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
