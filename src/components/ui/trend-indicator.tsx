import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  className?: string;
  showValue?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  format?: (value: number) => string;
}

function TrendIndicator({
  value,
  previousValue = 0,
  className,
  showValue = true,
  showIcon = true,
  size = "md",
  format,
}: TrendIndicatorProps) {
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / Math.abs(previousValue)) * 100 : 0;

  const direction: TrendDirection = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const colorClasses = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-slate-500 dark:text-slate-400",
  };

  const bgClasses = {
    up: "bg-green-100 dark:bg-green-900/30",
    down: "bg-red-100 dark:bg-red-900/30",
    neutral: "bg-slate-100 dark:bg-slate-800",
  };

  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  const displayValue = format
    ? format(change)
    : `${change >= 0 ? "+" : ""}${percentChange.toFixed(1)}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
        sizeClasses[size],
        colorClasses[direction],
        bgClasses[direction],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], "flex-shrink-0")} />}
      {showValue && <span className="tabular-nums">{displayValue}</span>}
    </span>
  );
}

interface TrendArrowProps {
  direction: TrendDirection;
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

function TrendArrow({ direction, className, size = "md", animate = true }: TrendArrowProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const colorClasses = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-slate-500 dark:text-slate-400",
  };

  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;

  return (
    <Icon
      className={cn(
        sizeClasses[size],
        colorClasses[direction],
        animate && direction !== "neutral" && "animate-pulse-subtle",
        className
      )}
    />
  );
}

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

function ProgressIndicator({
  value,
  max = 100,
  className,
  showLabel = true,
  size = "md",
  variant = "default",
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    default: "bg-slate-600 dark:bg-slate-400",
    success: "bg-green-600 dark:bg-green-400",
    warning: "bg-amber-600 dark:bg-amber-400",
    danger: "bg-red-600 dark:bg-red-400",
  };

  // Auto-determine variant based on value
  const autoVariant =
    variant === "default"
      ? percentage >= 80
        ? "success"
        : percentage >= 50
          ? "warning"
          : "danger"
      : variant;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>{value.toFixed(0)}</span>
          <span>{max}</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            heightClasses[size],
            colorClasses[autoVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface MetricBadgeProps {
  label: string;
  value: number | string;
  trend?: TrendDirection;
  className?: string;
}

function MetricBadge({ label, value, trend, className }: MetricBadgeProps) {
  const trendColors = {
    up: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30",
    down: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30",
    neutral: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-xl border px-4 py-2",
        trend ? trendColors[trend] : trendColors.neutral,
        className
      )}
    >
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

export { TrendIndicator, TrendArrow, ProgressIndicator, MetricBadge };
