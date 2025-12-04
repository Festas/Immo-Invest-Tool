import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "title" | "avatar" | "card" | "button" | "chart";
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full rounded",
    title: "h-6 w-3/4 rounded",
    avatar: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-lg",
    button: "h-10 w-24 rounded-lg",
    chart: "h-64 w-full rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-700",
        "relative overflow-hidden",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="shimmer absolute inset-0" />
    </div>
  );
}

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasHeader?: boolean;
  lines?: number;
}

function SkeletonCard({ className, hasHeader = true, lines = 3, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className="mb-4 flex items-center gap-3">
          <Skeleton variant="avatar" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "bar" | "line";
}

function SkeletonChart({ className, type = "bar", ...props }: SkeletonChartProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-6",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex items-center gap-3">
        <Skeleton variant="avatar" className="h-10 w-10 rounded-lg" />
        <Skeleton variant="title" className="w-1/4" />
      </div>
      <div className="relative h-64">
        {type === "bar" ? (
          <div className="flex h-full items-end justify-around gap-2 px-4">
            {[60, 80, 45, 90, 70, 85, 55].map((height, i) => (
              <Skeleton
                key={i}
                className="w-8 rounded-t"
                style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : (
          <Skeleton variant="chart" className="h-full" />
        )}
      </div>
    </div>
  );
}

function SkeletonMetric({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--surface-2)] p-5",
        className
      )}
      {...props}
    >
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mb-2 h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonChart, SkeletonMetric };
