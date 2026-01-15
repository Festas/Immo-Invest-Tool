"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";
import { Sparkles } from "lucide-react";

interface CalculationFeedbackProps {
  /**
   * Whether calculation is in progress
   */
  isCalculating?: boolean;
  /**
   * Children to show when not calculating
   */
  children: React.ReactNode;
  /**
   * Optional celebration for excellent results
   */
  showCelebration?: boolean;
  /**
   * Callback when calculation completes
   */
  onCalculationComplete?: () => void;
}

/**
 * CalculationFeedback component
 * Shows skeleton loader during calculation and smooth transition to results
 */
export function CalculationFeedback({
  isCalculating = false,
  children,
  showCelebration = false,
  onCalculationComplete,
}: CalculationFeedbackProps) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const previousCalculating = React.useRef(isCalculating);

  React.useEffect(() => {
    // Calculation just finished
    if (previousCalculating.current && !isCalculating) {
      setIsTransitioning(true);
      onCalculationComplete?.();

      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timeout);
    }

    previousCalculating.current = isCalculating;
  }, [isCalculating, onCalculationComplete]);

  if (isCalculating) {
    return (
      <div className="animate-pulse space-y-4" role="status" aria-label="Berechnung läuft">
        <div className="animate-shimmer h-8 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="animate-shimmer h-8 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="animate-shimmer h-8 w-4/6 rounded bg-slate-200 dark:bg-slate-700" />
        <span className="sr-only">Berechnung läuft...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isTransitioning && "animate-fade-in",
        showCelebration && !shouldReduceMotion() && "animate-pulse-once"
      )}
    >
      {showCelebration && !shouldReduceMotion() && (
        <div className="mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-semibold">Hervorragendes Ergebnis!</span>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * ValueChangeHighlight component
 * Highlights a value with a color flash when it changes
 */
interface ValueChangeHighlightProps {
  value: number;
  children: React.ReactNode;
  className?: string;
  /**
   * Threshold for considering a change significant
   */
  threshold?: number;
}

export function ValueChangeHighlight({
  value,
  children,
  className,
  threshold = 0,
}: ValueChangeHighlightProps) {
  const [changeType, setChangeType] = React.useState<"increase" | "decrease" | null>(null);
  const previousValue = React.useRef(value);

  React.useEffect(() => {
    const diff = value - previousValue.current;

    // Only highlight if change is above threshold
    if (Math.abs(diff) > threshold && !shouldReduceMotion()) {
      setChangeType(diff > 0 ? "increase" : "decrease");

      const timeout = setTimeout(() => {
        setChangeType(null);
      }, 600);

      previousValue.current = value;

      return () => clearTimeout(timeout);
    }

    previousValue.current = value;
  }, [value, threshold]);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        changeType === "increase" && "animate-flash-green",
        changeType === "decrease" && "animate-flash-red",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Confetti component for celebrations
 * Can be toggled via localStorage setting
 */
interface ConfettiProps {
  /**
   * Whether to show confetti
   */
  show: boolean;
  /**
   * Duration in milliseconds
   */
  duration?: number;
}

const CONFETTI_STORAGE_KEY = "immocalc-confetti-enabled";

/**
 * Check if confetti is enabled in settings
 */
export function isConfettiEnabled(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(CONFETTI_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

/**
 * Toggle confetti enabled state
 */
export function toggleConfetti(): void {
  if (typeof window === "undefined") return;

  try {
    const current = isConfettiEnabled();
    localStorage.setItem(CONFETTI_STORAGE_KEY, String(!current));
  } catch {
    // Ignore errors
  }
}

export function Confetti({ show, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = React.useState<
    Array<{ id: number; left: number; delay: number }>
  >([]);

  React.useEffect(() => {
    if (show && isConfettiEnabled() && !shouldReduceMotion()) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 200,
      }));

      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [show, duration]);

  if (particles.length === 0) return null;

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "animate-confetti absolute top-0 h-3 w-3 rounded-full",
            colors[particle.id % colors.length]
          )}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
