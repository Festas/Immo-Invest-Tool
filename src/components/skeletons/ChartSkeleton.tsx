import React from "react";

export function ChartSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Diagramm wird geladen">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="animate-shimmer mb-4 h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="animate-shimmer h-64 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
