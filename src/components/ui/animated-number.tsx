"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function AnimatedNumber({
  value,
  format,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const previousValue = React.useRef(0);
  const animationRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayValue(endValue);
      previousValue.current = endValue;
      return;
    }

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = format ? format(displayValue) : displayValue.toFixed(0);

  return (
    <span
      className={cn("tabular-nums transition-colors", isAnimating && "text-opacity-90", className)}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

interface AnimatedPercentageProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  showSign?: boolean;
}

function AnimatedPercentage({
  value,
  decimals = 2,
  duration = 1000,
  className,
  showSign = false,
}: AnimatedPercentageProps) {
  const formatPercent = (val: number) => {
    const sign = showSign && val > 0 ? "+" : "";
    return `${sign}${val.toFixed(decimals)}%`;
  };

  return (
    <AnimatedNumber
      value={value}
      format={formatPercent}
      duration={duration}
      className={className}
    />
  );
}

interface AnimatedCurrencyProps {
  value: number;
  locale?: string;
  currency?: string;
  duration?: number;
  className?: string;
}

function AnimatedCurrency({
  value,
  locale = "de-DE",
  currency = "EUR",
  duration = 1000,
  className,
}: AnimatedCurrencyProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AnimatedNumber
      value={value}
      format={formatCurrency}
      duration={duration}
      className={className}
    />
  );
}

export { AnimatedNumber, AnimatedPercentage, AnimatedCurrency };
