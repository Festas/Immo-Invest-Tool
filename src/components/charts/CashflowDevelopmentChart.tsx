"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
import { useTheme } from "@/components/theme";
import {
  calculatePropertyKPIs,
  generateFullAmortizationSchedule,
  calculateExtendedCashflowProjection,
  calculateLoanAmount,
  getChartInterval,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

/**
 * CashflowDevelopmentChart - Shows monthly cashflow over time
 */
export function CashflowDevelopmentChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Calculate loan amount
  const loanAmount = calculateLoanAmount(
    output.investmentVolume.totalInvestment,
    currentInput.equity
  );

  // Generate full amortization schedule
  const fullSchedule = generateFullAmortizationSchedule(
    loanAmount,
    currentInput.interestRate,
    currentInput.repaymentRate,
    50
  );

  // Calculate extended cashflow projection
  const cashflowProjection = calculateExtendedCashflowProjection(
    currentInput,
    fullSchedule,
    fullSchedule.length
  );

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const referenceLineColor = isDark ? "#64748b" : "#94a3b8";

  // Prepare chart data - sample every few years for readability
  const interval = getChartInterval(cashflowProjection.length);
  const chartData = cashflowProjection
    .filter(
      (_, index) => index % interval === 0 || index === cashflowProjection.length - 1 || index === 0
    )
    .map((point) => ({
      year: `Jahr ${point.year}`,
      Cashflow: Math.round(point.monthlyCashflowAfterTax),
    }));

  const firstCashflow = cashflowProjection[0]?.monthlyCashflowAfterTax || 0;
  const lastCashflow =
    cashflowProjection[cashflowProjection.length - 1]?.monthlyCashflowAfterTax || 0;
  const maxCashflow = Math.max(...cashflowProjection.map((p) => p.monthlyCashflowAfterTax));

  // Find the debt-free year and cashflow
  const debtFreePoint = cashflowProjection.find((p) => p.isDebtFree);
  const debtFreeYear = debtFreePoint?.year || 0;
  const debtFreeCashflow = debtFreePoint?.monthlyCashflowAfterTax || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 shadow-lg dark:from-indigo-500 dark:to-indigo-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Cashflow-Entwicklung</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="chart-animate-in h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cashflowDevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.5} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor, strokeOpacity: 0.5 }}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}€`}
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    return (
                      <div className="animate-fade-in rounded-lg border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/95">
                        <p className="mb-2 font-semibold text-slate-900 dark:text-white">{label}</p>
                        <p
                          className={`text-sm font-semibold ${
                            value >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          Monatlicher Cashflow: {formatCurrency(value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={0}
                stroke={referenceLineColor}
                strokeDasharray="3 3"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Cashflow"
                name="Monatlicher Cashflow"
                stroke="#6366f1"
                fill="url(#cashflowDevGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div
          className={`mt-6 grid gap-4 text-sm ${
            debtFreePoint ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"
          }`}
        >
          <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30">
            <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">Jahr 1</p>
            <p
              className={`text-xl font-bold tabular-nums ${
                firstCashflow >= 0
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {formatCurrency(firstCashflow)}
            </p>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 text-center dark:border-indigo-800 dark:from-indigo-900/30 dark:to-indigo-900/20">
            <p className="mb-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">Maximum</p>
            <p className="text-xl font-bold text-indigo-700 tabular-nums dark:text-indigo-300">
              {formatCurrency(maxCashflow)}
            </p>
          </div>
          {debtFreePoint && (
            <div className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 text-center dark:border-emerald-800 dark:from-emerald-900/30 dark:to-emerald-900/20">
              <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Nach Tilgung (Jahr {debtFreeYear})
              </p>
              <p className="text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
                {formatCurrency(debtFreeCashflow)}
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Kein Schuldendienst
              </p>
            </div>
          )}
          <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30">
            <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              Jahr {cashflowProjection.length}
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                lastCashflow >= 0
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {formatCurrency(lastCashflow)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
