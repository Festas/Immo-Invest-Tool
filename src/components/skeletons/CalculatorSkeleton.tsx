import React from "react";

export function CalculatorSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Rechner wird geladen">
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="animate-shimmer h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="animate-shimmer h-6 w-40 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Form-like content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="animate-shimmer h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="animate-shimmer h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Results section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="animate-shimmer mb-4 h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="animate-shimmer h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="animate-shimmer h-6 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
