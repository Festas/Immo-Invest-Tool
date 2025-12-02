"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useImmoCalcStore } from "@/store";
import { calculateBreakEven, calculatePropertyKPIs } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { BreakEvenResult } from "@/types";
import { Target, Clock, TrendingUp, Calculator, PiggyBank } from "lucide-react";

// Help texts for break-even calculator
const helpTexts = {
  appreciation: `Erwartete jährliche Wertsteigerung der Immobilie.

📍 Richtwerte:
• Konservativ: 1-2% p.a.
• Normal: 2-3% p.a.
• Optimistisch: 3-4% p.a.

💡 Historisch sind 2-3% realistisch. In Großstädten kann es mehr sein.`,

  sellingCosts: `Kosten beim Verkauf der Immobilie.

📍 Typische Kosten:
• Makler: 3-6%
• Notar: 0,5-1%
• Sonstige: 0,5-1%

💡 Insgesamt meist 5-8% des Verkaufspreises.`,
};

export function BreakEvenCalculator() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const [appreciationRate, setAppreciationRate] = useState(2.0);
  const [sellingCostsPercent, setSellingCostsPercent] = useState(6.0);
  const [result, setResult] = useState<BreakEvenResult | null>(null);

  const handleCalculate = () => {
    const breakEvenResult = calculateBreakEven({
      totalInvestment: output.investmentVolume.totalInvestment,
      annualCashflow: output.cashflow.cashflowAfterTax,
      annualAppreciation: appreciationRate,
      sellingCostsPercent: sellingCostsPercent,
    });
    setResult(breakEvenResult);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Break-Even Analyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Berechnen Sie, wann sich Ihre Immobilieninvestition amortisiert hat.
            Diese Berechnung basiert auf Ihren aktuellen Eingaben im Rechner.
          </p>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
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
                <span className="text-blue-600 dark:text-blue-400">Jährlicher Cashflow:</span>
                <p className={`font-semibold ${output.cashflow.cashflowAfterTax >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(output.cashflow.cashflowAfterTax)}
                </p>
              </div>
            </div>
          </div>

          <Slider
            label="Erwartete jährliche Wertsteigerung"
            min={0}
            max={5}
            step={0.1}
            value={appreciationRate}
            onChange={(value) => setAppreciationRate(value)}
            formatValue={(v) => `${v.toFixed(1)}%`}
            helpText={helpTexts.appreciation}
          />

          <Slider
            label="Verkaufsnebenkosten"
            min={3}
            max={12}
            step={0.5}
            value={sellingCostsPercent}
            onChange={(value) => setSellingCostsPercent(value)}
            formatValue={(v) => `${v.toFixed(1)}%`}
            helpText={helpTexts.sellingCosts}
          />

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Break-Even berechnen
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-orange-600" />
                Amortisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg text-center">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Nur durch Cashflow
                  </p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {result.breakEvenYearsCashflow < 100
                      ? `${result.breakEvenYearsCashflow} Jahre`
                      : "Nie (neg. Cashflow)"}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Zeit bis kumulierter Cashflow = Investment
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Inkl. Wertsteigerung
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {result.breakEvenYearsTotal < 100
                      ? `${result.breakEvenYearsTotal} Jahre`
                      : "Nie"}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Zeit bis Gesamtrendite = Investment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Renditeprognose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 text-slate-900 dark:text-slate-100">Zeitraum</th>
                      <th className="text-right py-3 px-2 text-slate-900 dark:text-slate-100">Gesamtrendite</th>
                      <th className="text-right py-3 px-2 text-slate-900 dark:text-slate-100">ROI</th>
                      <th className="text-right py-3 px-2 text-slate-900 dark:text-slate-100">ROI p.a.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-300">Nach 5 Jahren</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(result.totalReturnAt5Years)}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${result.roiAt5Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.roiAt5Years.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-2 text-right ${result.roiAt5Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {(result.roiAt5Years / 5).toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-300">Nach 10 Jahren</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(result.totalReturnAt10Years)}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${result.roiAt10Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.roiAt10Years.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-2 text-right ${result.roiAt10Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {(result.roiAt10Years / 10).toFixed(2)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-300">Nach 15 Jahren</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(result.totalReturnAt15Years)}
                      </td>
                      <td className={`py-3 px-2 text-right font-medium ${result.roiAt15Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.roiAt15Years.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-2 text-right ${result.roiAt15Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {(result.roiAt15Years / 15).toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">Vermögensaufbau nach 15 Jahren</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bei einer jährlichen Wertsteigerung von {appreciationRate.toFixed(1)}% und 
                  Berücksichtigung des Cashflows beträgt Ihre Gesamtrendite{" "}
                  <strong className={result.roiAt15Years >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrency(result.totalReturnAt15Years)}
                  </strong>.
                  Das entspricht einer durchschnittlichen jährlichen Rendite von{" "}
                  <strong className="text-slate-900 dark:text-slate-100">{(result.roiAt15Years / 15).toFixed(2)}%</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
