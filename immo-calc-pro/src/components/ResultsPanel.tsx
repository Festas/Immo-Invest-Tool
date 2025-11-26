"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

export function ResultsPanel() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  const isPositiveCashflow = output.cashflow.cashflowAfterTax >= 0;

  return (
    <div className="space-y-4">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Investment */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Gesamtinvestition</span>
            </div>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(output.investmentVolume.totalInvestment)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              EK: {formatCurrency(currentInput.equity)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Payment */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Calculator className="h-4 w-4" />
              <span className="text-xs font-medium">Rate/Monat</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(output.financing.monthlyPayment)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Darlehen: {formatCurrency(output.financing.loanAmount)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Cashflow */}
        <Card
          className={`${
            isPositiveCashflow
              ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
              : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800"
          }`}
        >
          <CardContent className="p-4">
            <div
              className={`flex items-center gap-2 mb-1 ${
                isPositiveCashflow
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositiveCashflow ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">Cashflow/Monat</span>
            </div>
            <p
              className={`text-xl font-bold ${
                isPositiveCashflow
                  ? "text-green-900 dark:text-green-100"
                  : "text-red-900 dark:text-red-100"
              }`}
            >
              {formatCurrency(output.cashflow.monthlyCashflowAfterTax)}
            </p>
            <p
              className={`text-xs mt-1 ${
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
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs font-medium">EK-Rendite</span>
            </div>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {output.yields.returnOnEquity.toFixed(2)}%
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              p.a. nach Steuern
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Yield Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Renditekennzahlen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bruttomietrendite</span>
              <span className="font-semibold">{output.yields.grossRentalYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nettomietrendite</span>
              <span className="font-semibold">{output.yields.netRentalYield.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Eigenkapitalrendite</span>
              <span className="font-semibold">{output.yields.returnOnEquity.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cashflow-Rendite</span>
              <span className="font-semibold">{output.yields.cashflowYield.toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Steuerliche Auswirkung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">AfA (jährlich)</span>
              <span>{formatCurrency(output.tax.afaAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Absetzbare Zinsen</span>
              <span>{formatCurrency(output.tax.deductibleInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Werbungskosten gesamt</span>
              <span>{formatCurrency(output.tax.totalDeductions)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Einkünfte aus V&V</span>
                <span
                  className={
                    output.tax.rentalIncomeAfterDeductions < 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrency(output.tax.rentalIncomeAfterDeductions)}
                </span>
              </div>
            </div>
            <div className="flex justify-between font-medium">
              <span>Steuereffekt (jährlich)</span>
              <span className={output.tax.taxEffect > 0 ? "text-green-600" : "text-red-600"}>
                {output.tax.taxEffect > 0 ? "+" : ""}
                {formatCurrency(output.tax.taxEffect)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Costs Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nebenkostenaufschlüsselung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Grunderwerbsteuer</span>
              <span>{formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Notar & Grundbuch</span>
              <span>{formatCurrency(output.investmentVolume.sideCosts.notaryCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Makler</span>
              <span>{formatCurrency(output.investmentVolume.sideCosts.brokerCost)}</span>
            </div>
            {output.investmentVolume.sideCosts.renovationCosts > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Renovierung</span>
                <span>{formatCurrency(output.investmentVolume.sideCosts.renovationCosts)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Nebenkosten gesamt</span>
                <span>{formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span></span>
                <span>({output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
