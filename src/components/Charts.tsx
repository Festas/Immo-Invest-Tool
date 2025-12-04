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
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/95">
        <p className="mb-2 font-semibold text-slate-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 pb-4 dark:bg-slate-800/50">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-slate-600 p-2 shadow-md dark:bg-slate-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Tilgungsverlauf</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="restschuldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="getilgtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Bar
                dataKey="Restschuld"
                name="Restschuld"
                fill="url(#restschuldGradient)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Getilgt"
                name="Getilgter Betrag"
                fill="url(#getilgtGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/30">
            <p className="mb-1 font-medium text-red-600 dark:text-red-400">
              Restschuld nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(
                output.amortizationSchedule[output.amortizationSchedule.length - 1]
                  ?.endingBalance || 0
              )}
            </p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/30">
            <p className="mb-1 font-medium text-green-600 dark:text-green-400">Gesamt getilgt</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(
                output.amortizationSchedule[output.amortizationSchedule.length - 1]
                  ?.cumulativePrincipal || 0
              )}
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 pb-4 dark:bg-slate-800/50">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="rounded-xl bg-slate-600 p-2 shadow-md dark:bg-slate-500">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Kumulierter Cashflow & Vermögensentwicklung
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cashflowLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="netWorthLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: axisColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <ReferenceLine y={0} stroke={referenceLineColor} strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="Cashflow"
                name="Kumulierter Cashflow"
                stroke="url(#cashflowLineGradient)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Nettovermögen"
                name="Nettovermögen"
                stroke="url(#netWorthLineGradient)"
                strokeWidth={3}
                dot={false}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-1 font-medium text-slate-600 dark:text-slate-400">
              Cashflow nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(
                output.cumulativeCashflow[output.cumulativeCashflow.length - 1]
                  ?.cumulativeCashflow || 0
              )}
            </p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/30">
            <p className="mb-1 font-medium text-green-600 dark:text-green-400">
              Nettovermögen nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(
                output.cumulativeCashflow[output.cumulativeCashflow.length - 1]?.netWorth || 0
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
