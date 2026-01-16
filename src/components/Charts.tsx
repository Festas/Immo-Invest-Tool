"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
import { useTheme } from "@/components/theme";
import {
  calculatePropertyKPIs,
  calculateYearsToFullRepayment,
  generateFullAmortizationSchedule,
  calculateExtendedCashflowProjection,
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
      <div className="animate-fade-in rounded-lg border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/95">
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

export function AmortizationChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";
  const [showFullRepayment, setShowFullRepayment] = React.useState(false);

  // Calculate loan amount
  const loanAmount = output.investmentVolume.totalInvestment - currentInput.equity;

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
  const interval = totalYears > 30 ? 5 : totalYears > 15 ? 3 : 2;

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
          <div className="group rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-green-800 dark:from-green-900/30 dark:to-green-900/20">
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

/**
 * CashflowDevelopmentChart - Shows monthly cashflow over time
 */
export function CashflowDevelopmentChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Calculate loan amount
  const loanAmount = output.investmentVolume.totalInvestment - currentInput.equity;

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
  const interval = cashflowProjection.length > 30 ? 5 : cashflowProjection.length > 15 ? 3 : 2;
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
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
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

/**
 * InterestPrincipalChart - Shows breakdown of interest vs principal payments
 */
export function InterestPrincipalChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Calculate loan amount
  const loanAmount = output.investmentVolume.totalInvestment - currentInput.equity;

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
  const interval = fullSchedule.length > 30 ? 5 : fullSchedule.length > 15 ? 3 : 2;
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

/**
 * EquityBuildupChart - Shows equity accumulation over time
 */
export function EquityBuildupChart() {
  const { currentInput } = useImmoCalcStore();
  const { resolvedTheme } = useTheme();
  const output = calculatePropertyKPIs(currentInput);
  const isDark = resolvedTheme === "dark";

  // Calculate loan amount
  const loanAmount = output.investmentVolume.totalInvestment - currentInput.equity;

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
  const interval = cashflowProjection.length > 30 ? 5 : cashflowProjection.length > 15 ? 3 : 2;
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
