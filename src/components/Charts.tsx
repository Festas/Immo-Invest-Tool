"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
import { useTheme } from "@/components/theme";
import { calculatePropertyKPIs } from "@/lib/calculations";
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
  Line,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number; dataKey?: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="animate-fade-in rounded-xl border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/95">
        <p className="mb-3 border-b border-slate-200 pb-2 font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 tabular-nums dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/** Number of years between data points on the amortization chart */
const CHART_YEAR_INTERVAL = 5;

export function AmortizationChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";

  // Select key years for chart (every CHART_YEAR_INTERVAL years)
  const chartData = output.amortizationSchedule
    .filter(
      (year, index) =>
        index % CHART_YEAR_INTERVAL === 0 || index === output.amortizationSchedule.length - 1
    )
    .map((year) => ({
      year: `Jahr ${year.year}`,
      Restschuld: Math.round(year.endingBalance),
      Getilgt: Math.round(year.cumulativePrincipal),
      Zinsen: Math.round(year.cumulativeInterest),
    }));

  const finalBalance =
    output.amortizationSchedule[output.amortizationSchedule.length - 1]?.endingBalance || 0;
  const totalPrincipal =
    output.amortizationSchedule[output.amortizationSchedule.length - 1]?.cumulativePrincipal || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Tilgungsverlauf</span>
        </CardTitle>
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
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="group rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-red-800 dark:from-red-900/30 dark:to-red-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
              <p className="font-medium text-red-600 dark:text-red-400">
                Restschuld nach {currentInput.fixedInterestPeriod} Jahren
              </p>
            </div>
            <p className="text-2xl font-bold text-red-700 tabular-nums dark:text-red-300">
              {formatCurrency(finalBalance)}
            </p>
          </div>
          <div className="group rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
              <p className="font-medium text-green-600 dark:text-green-400">Gesamt getilgt</p>
            </div>
            <p className="text-2xl font-bold text-green-700 tabular-nums dark:text-green-300">
              {formatCurrency(totalPrincipal)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CumulativeCashflowChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Theme-aware colors
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const referenceLineColor = isDark ? "#64748b" : "#94a3b8";

  const chartData = output.cumulativeCashflow.map((point) => ({
    year: `Jahr ${point.year}`,
    Cashflow: Math.round(point.cumulativeCashflow),
    Nettovermögen: Math.round(point.netWorth),
    Immobilienwert: Math.round(point.propertyValue),
  }));

  const finalCashflow =
    output.cumulativeCashflow[output.cumulativeCashflow.length - 1]?.cumulativeCashflow || 0;
  const finalNetWorth =
    output.cumulativeCashflow[output.cumulativeCashflow.length - 1]?.netWorth || 0;

  return (
    <Card className="overflow-hidden" animate>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 pb-4 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-2 shadow-lg dark:from-slate-500 dark:to-slate-600">
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
          <div className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-800/30">
            <p className="mb-2 font-medium text-slate-600 dark:text-slate-400">
              Cashflow nach {currentInput.fixedInterestPeriod} Jahren
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
          <div className="group rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
            <div className="mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
              <p className="font-medium text-green-600 dark:text-green-400">
                Nettovermögen nach {currentInput.fixedInterestPeriod} Jahren
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
