import React from "react";

export function ChartSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Diagramm wird geladen">
      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
        <div className="skeleton skeleton-title mb-4 w-48" />
        <div className="skeleton h-64 w-full rounded-lg" />
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
