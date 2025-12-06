import React from "react";

export function CalculatorSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Rechner wird geladen">
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="skeleton skeleton-title w-40" />
      </div>

      {/* Form-like content */}
      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton skeleton-text w-24" />
              <div className="skeleton h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Results section */}
      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
        <div className="skeleton skeleton-title mb-4 w-32" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton skeleton-text w-20" />
              <div className="skeleton h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
