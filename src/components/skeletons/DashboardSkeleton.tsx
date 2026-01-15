import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Dashboard wird geladen">
      {/* Header section skeleton */}
      <div className="flex items-center gap-4">
        <div className="animate-shimmer h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="animate-shimmer h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="animate-shimmer h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="animate-shimmer mb-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="animate-shimmer h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="animate-shimmer mt-4 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Large content area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="animate-shimmer mb-6 h-6 w-64 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="animate-shimmer h-48 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
