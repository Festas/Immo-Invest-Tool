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
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

/**
 * EquityBuildupChart - Shows equity accumulation over time
 */
export function EquityBuildupChart() {
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

  // Prepare chart data
  const interval = getChartInterval(cashflowProjection.length);
  const chartData = React.useMemo(() => {
    const filtered = cashflowProjection.filter(
      (_, index) => index % interval === 0 || index === cashflowProjection.length - 1 || index === 0
    );

    return filtered.map((point, index) => {
      const tilgung = loanAmount - point.remainingDebt;
      const wertsteigerung = point.propertyValue - currentInput.purchasePrice;

      // Calculate cumulative cashflow up to this point
      const cumulativeCashflow = filtered
        .slice(0, index + 1)
        .reduce((sum, p) => sum + p.cashflowAfterTax * (interval || 1), 0);

      return {
        year: `Jahr ${point.year}`,
        Eigenkapital: Math.round(currentInput.equity),
        Tilgung: Math.round(tilgung),
        Wertsteigerung: Math.round(wertsteigerung),
        KumulierterCashflow: Math.round(cumulativeCashflow),
      };
    });
  }, [cashflowProjection, interval, loanAmount, currentInput.equity, currentInput.purchasePrice]);

  // Calculate final equity
  const finalEquity = React.useMemo(() => {
    const cumulativeCashflow = cashflowProjection.reduce(
      (sum, point) => sum + point.cashflowAfterTax,
      0
    );
    const lastPoint = cashflowProjection[cashflowProjection.length - 1];
    return lastPoint ? lastPoint.equityValue + cumulativeCashflow : 0;
  }, [cashflowProjection]);

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 shadow-lg dark:from-emerald-500 dark:to-emerald-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Eigenkapitalaufbau</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="chart-animate-in h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="ekGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="tilgungEqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="wertsteigerungGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="cashflowEqGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {value}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="Eigenkapital"
                name="Eingesetztes EK"
                stackId="1"
                stroke="#64748b"
                fill="url(#ekGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Tilgung"
                name="Kumulierte Tilgung"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#tilgungEqGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Wertsteigerung"
                name="Wertsteigerung"
                stackId="1"
                stroke="#10b981"
                fill="url(#wertsteigerungGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="KumulierterCashflow"
                name="Kumulierter Cashflow"
                stackId="1"
                stroke="#8b5cf6"
                fill="url(#cashflowEqGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30">
            <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              Start-Eigenkapital
            </p>
            <p className="text-xl font-bold text-slate-700 tabular-nums dark:text-slate-300">
              {formatCurrency(currentInput.equity)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 text-center dark:border-emerald-800 dark:from-emerald-900/30 dark:to-emerald-900/20">
            <p className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Gesamt-Vermögen
            </p>
            <p className="text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
              {formatCurrency(finalEquity)}
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center md:col-span-1 dark:border-blue-800 dark:from-blue-900/30 dark:to-blue-900/20">
            <p className="mb-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              Multiplikator
            </p>
            <p className="text-xl font-bold text-blue-700 tabular-nums dark:text-blue-300">
              {(finalEquity / currentInput.equity).toFixed(1)}x
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
