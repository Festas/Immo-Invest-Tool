"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  max?: number;
  min?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
  zones?: {
    color: string;
    darkColor?: string;
    from: number;
    to: number;
  }[];
}

/**
 * Semi-circular gauge component for visualizing percentages/values
 * Default zones: red (0-3%), yellow (3-6%), green (6%+)
 */
function Gauge({
  value,
  max = 20,
  min = 0,
  className,
  size = "md",
  showValue = true,
  label,
  zones = [
    { color: "#ef4444", darkColor: "#f87171", from: 0, to: 3 },
    { color: "#f59e0b", darkColor: "#fbbf24", from: 3, to: 6 },
    { color: "#22c55e", darkColor: "#4ade80", from: 6, to: 20 },
  ],
}: GaugeProps) {
  const [mounted, setMounted] = React.useState(false);
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimatedValue(value);
      return;
    }

    // Animate the gauge fill
    const startTime = performance.now();
    const duration = 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(value * easeOutCubic);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const sizeConfig = {
    sm: { width: 100, height: 60, strokeWidth: 8, fontSize: "text-lg", labelSize: "text-xs" },
    md: { width: 140, height: 80, strokeWidth: 10, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { width: 180, height: 100, strokeWidth: 12, fontSize: "text-3xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = config.width / 2 - config.strokeWidth;
  const circumference = Math.PI * radius; // Half circle
  const clampedValue = Math.min(Math.max(animatedValue, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const strokeDashoffset = circumference * (1 - percentage);

  // Determine current zone color
  const currentZone =
    zones.find((zone) => value >= zone.from && value < zone.to) || zones[zones.length - 1];

  if (!mounted) {
    return (
      <div className={cn("relative inline-flex flex-col items-center", className)}>
        <div
          style={{ width: config.width, height: config.height }}
          className="animate-pulse rounded bg-slate-200 dark:bg-slate-700"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height + 10}`}
        className="overflow-visible"
      >
        {/* Background zones */}
        {zones.map((zone, index) => {
          const zoneStart = (zone.from - min) / (max - min);
          const zoneEnd = (zone.to - min) / (max - min);
          const zoneLength = (zoneEnd - zoneStart) * circumference;
          const zoneOffset = circumference * (1 - zoneEnd);

          return (
            <path
              key={index}
              d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={config.strokeWidth}
              strokeDasharray={`${zoneLength} ${circumference}`}
              strokeDashoffset={zoneOffset}
              strokeLinecap="round"
              className="opacity-20 dark:opacity-15"
              style={{ color: zone.color }}
            />
          );
        })}

        {/* Background track */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-700"
        />

        {/* Animated fill */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke={currentZone.color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out dark:hidden"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        />
        {/* Dark mode fill */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke={currentZone.darkColor || currentZone.color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="hidden transition-all duration-300 ease-out dark:block"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        {/* Min/Max labels */}
        <text
          x={config.strokeWidth / 2}
          y={config.height + 14}
          className="fill-slate-400 dark:fill-slate-500"
          fontSize="10"
          textAnchor="start"
        >
          {min}%
        </text>
        <text
          x={config.width - config.strokeWidth / 2}
          y={config.height + 14}
          className="fill-slate-400 dark:fill-slate-500"
          fontSize="10"
          textAnchor="end"
        >
          {max}%
        </text>
      </svg>

      {/* Center value */}
      {showValue && (
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span
            className={cn(
              config.fontSize,
              "font-bold text-slate-900 tabular-nums dark:text-slate-100"
            )}
          >
            {value.toFixed(1)}%
          </span>
          {label && (
            <p className={cn(config.labelSize, "mt-0.5 text-slate-500 dark:text-slate-400")}>
              {label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { Gauge };
export type { GaugeProps };
