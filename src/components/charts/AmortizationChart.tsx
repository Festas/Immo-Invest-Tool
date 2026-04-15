"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
import { useTheme } from "@/components/theme";
import {
  calculatePropertyKPIs,
  calculateYearsToFullRepayment,
  generateFullAmortizationSchedule,
  calculateLoanAmount,
  getChartInterval,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

export function AmortizationChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";
  const [showFullRepayment, setShowFullRepayment] = React.useState(false);

  // Calculate loan amount
  const loanAmount = calculateLoanAmount(
    output.investmentVolume.totalInvestment,
    currentInput.equity
  );

  // Get appropriate schedule based on toggle
  const schedule = showFullRepayment
    ? generateFullAmortizationSchedule(
        loanAmount,
        currentInput.interestRate,
        currentInput.repaymentRate
      )
    : output.amortizationSchedule;

  // Calculate years to full repayment
  const yearsToFullRepayment = calculateYearsToFullRepayment(
    loanAmount,
    currentInput.interestRate,
    currentInput.repaymentRate
  );

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";

  // Determine interval based on total years
  const totalYears = schedule.length;
  const interval = getChartInterval(totalYears);

  // Select key years for chart
  const chartData = schedule
    .filter(
      (_year, index) => index % interval === 0 || index === schedule.length - 1 || index === 0
    )
    .map((year) => ({
      year: `Jahr ${year.year}`,
      Restschuld: Math.round(year.endingBalance),
      Getilgt: Math.round(year.cumulativePrincipal),
      Zinsen: Math.round(year.cumulativeInterest),
    }));

  const finalBalance = schedule[schedule.length - 1]?.endingBalance || 0;
  const totalPrincipal = schedule[schedule.length - 1]?.cumulativePrincipal || 0;
  const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Tilgungsverlauf</span>
          </CardTitle>
          <button
            onClick={() => setShowFullRepayment(!showFullRepayment)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {showFullRepayment ? "Bis Zinsbindung" : "Bis Tilgung"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="chart-animate-in h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="restschuldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="getilgtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.8} />
                </linearGradient>
                <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                </filter>
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
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(100, 116, 139, 0.1)" }} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="Restschuld"
                name="Restschuld"
                fill="url(#restschuldGradient)"
                radius={[6, 6, 0, 0]}
                filter="url(#barShadow)"
              />
              <Bar
                dataKey="Getilgt"
                name="Getilgter Betrag"
                fill="url(#getilgtGradient)"
                radius={[6, 6, 0, 0]}
                filter="url(#barShadow)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div className="group rounded-lg border border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-red-800 dark:from-red-900/30 dark:to-red-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
              <p className="font-medium text-red-600 dark:text-red-400">
                Restschuld nach {schedule.length} Jahren
              </p>
            </div>
            <p className="text-2xl font-bold text-red-700 tabular-nums dark:text-red-300">
              {formatCurrency(finalBalance)}
            </p>
          </div>
          <div className="group rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
              <p className="font-medium text-green-600 dark:text-green-400">Gesamt getilgt</p>
            </div>
            <p className="text-2xl font-bold text-green-700 tabular-nums dark:text-green-300">
              {formatCurrency(totalPrincipal)}
            </p>
          </div>
          <div className="group rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:col-span-1 dark:border-blue-800 dark:from-blue-900/30 dark:to-blue-900/20">
            <p className="mb-2 font-medium text-blue-600 dark:text-blue-400">Jahre bis Tilgung</p>
            <p className="text-2xl font-bold text-blue-700 tabular-nums dark:text-blue-300">
              {yearsToFullRepayment} Jahre
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Gesamt Zinsen: {formatCurrency(totalInterest)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
