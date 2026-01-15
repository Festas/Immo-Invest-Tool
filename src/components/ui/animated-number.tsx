"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { shouldReduceMotion, VALUE_CHANGE_FLASH_DURATION } from "@/lib/animations";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showColorFlash?: boolean; // Enable color flash on value change
}

function AnimatedNumber({
  value,
  format,
  duration = 800,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
  showColorFlash = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [colorFlash, setColorFlash] = React.useState<"increase" | "decrease" | null>(null);
  const previousValue = React.useRef(value);
  const animationRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    // Skip if value hasn't changed
    if (startValue === endValue) {
      return;
    }

    // Determine if value increased or decreased for color flash
    if (showColorFlash) {
      setColorFlash(endValue > startValue ? "increase" : "decrease");
      setTimeout(() => setColorFlash(null), VALUE_CHANGE_FLASH_DURATION);
    }

    // Check for reduced motion preference
    const prefersReducedMotion = shouldReduceMotion();

    if (prefersReducedMotion) {
      setDisplayValue(endValue);
      previousValue.current = endValue;
      return;
    }

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic) for smooth deceleration
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
  }, [value, duration, showColorFlash]);

  // Format value with thousand separators (German format: 1.234.567,89)
  const formatWithSeparators = (val: number, decimalPlaces: number = decimals): string => {
    const [integerPart, decimalPart] = val.toFixed(decimalPlaces).split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
  };

  const formattedValue = format
    ? format(displayValue)
    : formatWithSeparators(displayValue, decimals);

  return (
    <span
      className={cn(
        "tabular-nums transition-all duration-300",
        isAnimating && "text-opacity-90",
        colorFlash === "increase" && "animate-flash-green",
        colorFlash === "decrease" && "animate-flash-red",
        className
      )}
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
  showColorFlash?: boolean;
}

function AnimatedPercentage({
  value,
  decimals = 2,
  duration = 800,
  className,
  showSign = false,
  showColorFlash = true,
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
      decimals={decimals}
      showColorFlash={showColorFlash}
    />
  );
}

interface AnimatedCurrencyProps {
  value: number;
  locale?: string;
  currency?: string;
  duration?: number;
  className?: string;
  decimals?: number;
  showColorFlash?: boolean;
}

function AnimatedCurrency({
  value,
  locale = "de-DE",
  currency = "EUR",
  duration = 800,
  className,
  decimals = 0,
  showColorFlash = true,
}: AnimatedCurrencyProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  return (
    <AnimatedNumber
      value={value}
      format={formatCurrency}
      duration={duration}
      className={className}
      decimals={decimals}
      showColorFlash={showColorFlash}
    />
  );
}

export { AnimatedNumber, AnimatedPercentage, AnimatedCurrency };
