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

  // Calculate current values based on holding period and appreciation
  const currentValue =
    output.investmentVolume.totalInvestment *
    Math.pow(1 + appreciationRate / 100, holdingPeriod);

  // Calculate remaining debt based on amortization
  const remainingDebt =
    holdingPeriod <= output.amortizationSchedule.length
      ? output.amortizationSchedule[holdingPeriod - 1]?.endingBalance || 0
      : 0;

  // Calculate cumulative cashflow
  const cumulativeCashflow = output.cashflow.cashflowAfterTax * holdingPeriod;

  const handleCalculate = () => {
    const exitResult = calculateExitStrategy({
      purchasePrice: output.investmentVolume.totalInvestment,
      currentValue: currentValue,
      holdingPeriodYears: holdingPeriod,
      remainingDebt: remainingDebt,
      cumulativeCashflow: cumulativeCashflow,
      speculationTaxApplies: holdingPeriod < 10,
      personalTaxRate: currentInput.personalTaxRate,
    });
    setResult(exitResult);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-purple-600" />
            Exit-Strategie / Verkaufsrechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Planen Sie Ihren Ausstieg und berechnen Sie Ihren Gewinn beim Verkauf
            der Immobilie. Diese Analyse berücksichtigt die Spekulationssteuer und
            alle relevanten Kosten.
          </p>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Ausgangswerte (aus aktuellem Rechner):
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600 dark:text-blue-400">
                  Gesamtinvestition:
                </span>
                <p className="font-semibold">
                  {formatCurrency(output.investmentVolume.totalInvestment)}
                </p>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">
                  Monatlicher Cashflow:
                </span>
                <p
                  className={`font-semibold ${
                    output.cashflow.monthlyCashflowAfterTax >= 0
                      ? "text-green-600"
                      : "text-red-600"
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
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-100 dark:border-yellow-900/50 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Achtung:</strong> Bei einer Haltedauer unter 10 Jahren
                fällt Spekulationssteuer auf den Gewinn an!
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

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <p className="text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
              Geschätzte Werte nach {holdingPeriod} Jahren:
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Immobilienwert:
                </span>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(currentValue)}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Restschuld:
                </span>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(remainingDebt)}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Kum. Cashflow:
                </span>
                <p
                  className={`font-semibold ${
                    cumulativeCashflow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(cumulativeCashflow)}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
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
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    Bruttogewinn (Wertzuwachs)
                  </span>
                  <span
                    className={`font-semibold ${
                      result.grossProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    Verkaufsnebenkosten (ca. 6%)
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(result.sellingCosts)}
                  </span>
                </div>
                {result.speculationTax > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 bg-yellow-50 dark:bg-yellow-950/50 -mx-4 px-4">
                    <span className="text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Spekulationssteuer
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(result.speculationTax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-medium text-slate-900 dark:text-slate-100">Nettogewinn aus Verkauf</span>
                  <span
                    className={`font-bold text-lg ${
                      result.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">
                    + Kumulierter Cashflow
                  </span>
                  <span
                    className={`font-semibold ${
                      cumulativeCashflow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(cumulativeCashflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-purple-50 dark:bg-purple-950/50 -mx-4 px-4 rounded">
                  <span className="font-bold text-purple-900 dark:text-purple-100">
                    GESAMTRENDITE
                  </span>
                  <span
                    className={`font-bold text-xl ${
                      result.totalReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(result.totalReturn)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="!bg-transparent bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Jährliche Durchschnittsrendite
                  </span>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    result.annualizedReturn >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.annualizedReturn.toFixed(2)}% p.a.
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  über {holdingPeriod} Jahre Haltedauer
                </p>
              </CardContent>
            </Card>

            <Card className="!bg-transparent bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Netto-Erlös nach Tilgung
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(currentValue - result.sellingCosts - result.speculationTax - remainingDebt)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Auszahlungsbetrag nach Darlehenstilgung
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="py-4">
              <div
                className={`p-4 rounded-lg border-l-4 ${
                  result.annualizedReturn >= 5
                    ? "bg-green-50 dark:bg-green-950/50 border-green-500"
                    : result.annualizedReturn >= 2
                    ? "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-500"
                    : "bg-red-50 dark:bg-red-950/50 border-red-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">Empfehlung</p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{result.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
