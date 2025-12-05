"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CoachMarkProps {
  /** Target element to highlight */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Alternative: target selector string */
  targetSelector?: string;
  /** Title of the coach mark */
  title: string;
  /** Description text */
  description: string;
  /** Position relative to target */
  position?: "top" | "bottom" | "left" | "right";
  /** Current step number */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Callback when next is clicked */
  onNext: () => void;
  /** Callback when skip is clicked */
  onSkip: () => void;
  /** Whether this is visible */
  isVisible: boolean;
  /** Whether this is the last step */
  isLastStep?: boolean;
}

/**
 * Coach Mark component for onboarding highlights
 */
export function CoachMark({
  targetRef,
  targetSelector,
  title,
  description,
  position = "bottom",
  step,
  totalSteps,
  onNext,
  onSkip,
  isVisible,
  isLastStep = false,
}: CoachMarkProps) {
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible) {
      setIsReady(false);
      return;
    }

    const updatePosition = () => {
      let element: HTMLElement | null = null;

      if (targetRef?.current) {
        element = targetRef.current;
      } else if (targetSelector) {
        element = document.querySelector(targetSelector);
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setIsReady(true);

        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, targetRef, targetSelector]);

  if (!isVisible || !isReady) return null;

  // Calculate popover position
  const getPopoverStyle = (): React.CSSProperties => {
    const padding = 12;
    const popoverWidth = 320;

    switch (position) {
      case "top":
        return {
          top: coords.top - padding - 10,
          left: coords.left + coords.width / 2 - popoverWidth / 2,
          transform: "translateY(-100%)",
        };
      case "bottom":
        return {
          top: coords.top + coords.height + padding,
          left: Math.max(
            16,
            Math.min(
              coords.left + coords.width / 2 - popoverWidth / 2,
              window.innerWidth - popoverWidth - 16
            )
          ),
        };
      case "left":
        return {
          top: coords.top + coords.height / 2,
          left: coords.left - padding - popoverWidth,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: coords.top + coords.height / 2,
          left: coords.left + coords.width + padding,
          transform: "translateY(-50%)",
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Overlay with spotlight */}
      <div className="fixed inset-0 z-[90]" onClick={onSkip}>
        {/* Dark overlay with cutout */}
        <svg className="h-full w-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={coords.left - 8}
                y={coords.top - 8}
                width={coords.width + 16}
                height={coords.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight border */}
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-indigo-500 ring-offset-4 ring-offset-white dark:ring-indigo-400 dark:ring-offset-slate-900"
          style={{
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8,
          }}
        />
      </div>

      {/* Popover */}
      <div
        className="animate-scale-in fixed z-[91] w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        style={getPopoverStyle()}
      >
        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{description}</p>

        {/* Progress and Actions */}
        <div className="flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i + 1 === step
                    ? "bg-indigo-500 dark:bg-indigo-400"
                    : i + 1 < step
                      ? "bg-indigo-300 dark:bg-indigo-600"
                      : "bg-slate-200 dark:bg-slate-600"
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              Überspringen
            </button>
            <button
              onClick={onNext}
              className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 dark:bg-indigo-400 dark:text-slate-900 dark:hover:bg-indigo-300"
            >
              {isLastStep ? "Fertig" : "Weiter"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
