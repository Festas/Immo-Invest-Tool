"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
import { useTheme } from "@/components/theme";
import {
  calculatePropertyKPIs,
  generateFullAmortizationSchedule,
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
import { BarChart3 } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

/**
 * InterestPrincipalChart - Shows breakdown of interest vs principal payments
 */
export function InterestPrincipalChart() {
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

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";

  // Prepare chart data - sample every few years for readability
  const interval = getChartInterval(fullSchedule.length);
  const chartData = fullSchedule
    .filter(
      (_, index) => index % interval === 0 || index === fullSchedule.length - 1 || index === 0
    )
    .map((year) => ({
      year: `Jahr ${year.year}`,
      Zins: Math.round(year.interestPayment),
      Tilgung: Math.round(year.principalPayment),
    }));

  const totalInterest = fullSchedule[fullSchedule.length - 1]?.cumulativeInterest || 0;
  const totalPrincipal = fullSchedule[fullSchedule.length - 1]?.cumulativePrincipal || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 p-2 shadow-lg dark:from-amber-500 dark:to-amber-600">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Zins- & Tilgungsverteilung
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="chart-animate-in h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="zinsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="tilgungGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
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
                dataKey="Zins"
                name="Zinszahlung"
                stackId="1"
                stroke="#f59e0b"
                fill="url(#zinsGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Tilgung"
                name="Tilgung"
                stackId="1"
                stroke="#10b981"
                fill="url(#tilgungGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 text-center dark:border-amber-800 dark:from-amber-900/30 dark:to-amber-900/20">
            <p className="mb-2 font-medium text-amber-600 dark:text-amber-400">Gesamt Zinsen</p>
            <p className="text-2xl font-bold text-amber-700 tabular-nums dark:text-amber-300">
              {formatCurrency(totalInterest)}
            </p>
          </div>
          <div className="rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
            <p className="mb-2 font-medium text-green-600 dark:text-green-400">Gesamt Tilgung</p>
            <p className="text-2xl font-bold text-green-700 tabular-nums dark:text-green-300">
              {formatCurrency(totalPrincipal)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
