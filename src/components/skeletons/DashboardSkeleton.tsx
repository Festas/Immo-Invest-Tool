import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Dashboard wird geladen">
      {/* Header section skeleton */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton skeleton-title w-48" />
          <div className="skeleton skeleton-text w-32" />
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
            <div className="skeleton skeleton-text mb-4 w-24" />
            <div className="skeleton h-8 w-32" />
            <div className="skeleton skeleton-text mt-4 w-full" />
          </div>
        ))}
      </div>

      {/* Large content area */}
      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-700">
        <div className="skeleton skeleton-title mb-6 w-64" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
      <span className="sr-only">Laden...</span>
    </div>
  );
}
