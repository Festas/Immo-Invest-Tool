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
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <p className="font-semibold mb-2 text-slate-900 dark:text-white">{label}</p>
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
    .filter((year, index) => index % CHART_YEAR_INTERVAL === 0 || index === output.amortizationSchedule.length - 1)
    .map((year) => ({
      year: `Jahr ${year.year}`,
      Restschuld: Math.round(year.endingBalance),
      Getilgt: Math.round(year.cumulativePrincipal),
      Zinsen: Math.round(year.cumulativeInterest),
    }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/50 dark:to-purple-900/50">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent font-bold">
            Tilgungsverlauf
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
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
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/50 dark:to-rose-900/50 rounded-xl border border-red-100 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium mb-1">Restschuld nach {currentInput.fixedInterestPeriod} Jahren</p>
            <p className="font-bold text-xl text-red-700 dark:text-red-300">
              {formatCurrency(
                output.amortizationSchedule[output.amortizationSchedule.length - 1]?.endingBalance || 0
              )}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">Gesamt getilgt</p>
            <p className="font-bold text-xl text-emerald-700 dark:text-emerald-300">
              {formatCurrency(
                output.amortizationSchedule[output.amortizationSchedule.length - 1]?.cumulativePrincipal || 0
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
      <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/50 dark:to-teal-900/50">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent font-bold">
            Kumulierter Cashflow & Vermögensentwicklung
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
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
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">
              Cashflow nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="font-bold text-xl text-indigo-700 dark:text-indigo-300">
              {formatCurrency(
                output.cumulativeCashflow[output.cumulativeCashflow.length - 1]?.cumulativeCashflow || 0
              )}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              Nettovermögen nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="font-bold text-xl text-emerald-700 dark:text-emerald-300">
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
