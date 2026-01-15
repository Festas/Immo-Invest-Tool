"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { PropertyOutput } from "@/types";

interface WizardLivePreviewProps {
  output: PropertyOutput | null;
  isComplete: boolean;
  className?: string;
}

export function WizardLivePreview({ output, isComplete, className }: WizardLivePreviewProps) {
  if (!isComplete || !output) {
    return (
      <Card className={cn("sticky top-24", className)}>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live-Vorschau</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Füllen Sie die Pflichtfelder aus, um eine Vorschau zu sehen
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeleton loaders */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const { yields, cashflow } = output;

  const kpis = [
    {
      label: "Bruttomietrendite",
      value: yields.grossRentalYield,
      format: "percent",
      icon: Percent,
      threshold: 4, // Good if > 4%
    },
    {
      label: "Nettomietrendite",
      value: yields.netRentalYield,
      format: "percent",
      icon: Percent,
      threshold: 3, // Good if > 3%
    },
    {
      label: "Monatlicher Cashflow",
      value: cashflow.monthlyCashflowAfterTax,
      format: "currency",
      icon: DollarSign,
      threshold: 0, // Good if > 0
    },
    {
      label: "Eigenkapitalrendite",
      value: yields.returnOnEquity,
      format: "percent",
      icon: TrendingUp,
      threshold: 5, // Good if > 5%
    },
  ];

  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live-Vorschau</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Wichtigste Kennzahlen auf einen Blick
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {kpis.map((kpi) => {
          const isPositive = kpi.value > kpi.threshold;
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.label}
              className={cn(
                "rounded-lg border-2 p-3 transition-all duration-200",
                isPositive
                  ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {kpi.label}
                  </span>
                </div>
                {isPositive ? (
                  <TrendingUp
                    className="h-4 w-4 text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  />
                ) : (
                  <TrendingDown
                    className="h-4 w-4 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div
                className={cn(
                  "mt-2 text-2xl font-bold",
                  isPositive
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                )}
              >
                {kpi.format === "percent"
                  ? `${kpi.value.toFixed(2)}%`
                  : `${kpi.value.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
