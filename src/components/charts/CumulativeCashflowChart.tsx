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
  addCumulativeCashflow,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

export function CumulativeCashflowChart() {
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

  // Calculate extended cashflow projection with dynamic factors
  const cashflowProjection = calculateExtendedCashflowProjection(
    currentInput,
    fullSchedule,
    fullSchedule.length
  );

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const referenceLineColor = isDark ? "#64748b" : "#94a3b8";

  // Calculate cumulative cashflow from dynamic projection
  const projectionsWithCumulative = React.useMemo(
    () => addCumulativeCashflow(cashflowProjection),
    [cashflowProjection]
  );

  const chartData = projectionsWithCumulative.map((point) => ({
    year: `Jahr ${point.year}`,
    Cashflow: Math.round(point.cumulativeCashflow),
    Nettovermögen: Math.round(point.equityValue + point.cumulativeCashflow),
    Immobilienwert: Math.round(point.propertyValue),
  }));

  const finalCashflow = chartData[chartData.length - 1]?.Cashflow || 0;
  const finalNetWorth = chartData[chartData.length - 1]?.Nettovermögen || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Kumulierter Cashflow & Vermögensentwicklung
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="chart-animate-in h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="cashflowLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="netWorthLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
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
              <ReferenceLine
                y={0}
                stroke={referenceLineColor}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="Cashflow"
                name="Kumulierter Cashflow"
                stroke="url(#cashflowLineGradient)"
                fill="url(#cashflowGradient)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="Nettovermögen"
                name="Nettovermögen"
                stroke="url(#netWorthLineGradient)"
                fill="url(#netWorthGradient)"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="Immobilienwert"
                name="Immobilienwert"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="group rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30">
            <p className="mb-2 font-medium text-slate-600 dark:text-slate-400">
              Cashflow nach {cashflowProjection.length} Jahren
            </p>
            <p
              className={`text-2xl font-bold tabular-nums ${
                finalCashflow >= 0
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {formatCurrency(finalCashflow)}
            </p>
          </div>
          <div className="group rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
              <p className="font-medium text-green-600 dark:text-green-400">
                Nettovermögen nach {cashflowProjection.length} Jahren
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700 tabular-nums dark:text-green-300">
              {formatCurrency(finalNetWorth)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
