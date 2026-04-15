"use client";

import { formatCurrency } from "@/lib/utils";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number; dataKey?: string }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
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
