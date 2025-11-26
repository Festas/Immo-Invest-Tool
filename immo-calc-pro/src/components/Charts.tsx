"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImmoCalcStore } from "@/store";
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

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function AmortizationChart() {
  const { currentInput } = useImmoCalcStore();
  const output = calculatePropertyKPIs(currentInput);

  // Select key years for chart (every 5 years)
  const chartData = output.amortizationSchedule
    .filter((year, index) => index % 5 === 0 || index === output.amortizationSchedule.length - 1)
    .map((year) => ({
      year: `Jahr ${year.year}`,
      Restschuld: Math.round(year.endingBalance),
      Getilgt: Math.round(year.cumulativePrincipal),
      Zinsen: Math.round(year.cumulativeInterest),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 Tilgungsverlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar
                dataKey="Restschuld"
                name="Restschuld"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Getilgt"
                name="Getilgter Betrag"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Restschuld nach {currentInput.fixedInterestPeriod} Jahren</p>
            <p className="font-bold text-lg">
              {formatCurrency(
                output.amortizationSchedule[output.amortizationSchedule.length - 1]?.endingBalance || 0
              )}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-green-600 dark:text-green-400">Gesamt getilgt</p>
            <p className="font-bold text-lg">
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
  const output = calculatePropertyKPIs(currentInput);

  const chartData = output.cumulativeCashflow.map((point) => ({
    year: `Jahr ${point.year}`,
    Cashflow: Math.round(point.cumulativeCashflow),
    Nettovermögen: Math.round(point.netWorth),
    Immobilienwert: Math.round(point.propertyValue),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📈 Kumulierter Cashflow & Vermögensentwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="Cashflow"
                name="Kumulierter Cashflow"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Nettovermögen"
                name="Nettovermögen"
                stroke="#22c55e"
                strokeWidth={2}
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
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-blue-600 dark:text-blue-400">
              Cashflow nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="font-bold text-lg">
              {formatCurrency(
                output.cumulativeCashflow[output.cumulativeCashflow.length - 1]?.cumulativeCashflow || 0
              )}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-green-600 dark:text-green-400">
              Nettovermögen nach {currentInput.fixedInterestPeriod} Jahren
            </p>
            <p className="font-bold text-lg">
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
