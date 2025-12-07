"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/hooks";

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
  /** Force fallback modal mode (for testing/debugging) */
  forceFallback?: boolean;
  /** Enable debug mode to show diagnostic information */
  debugMode?: boolean;
}

interface DebugInfo {
  targetSelector: string;
  targetFound: boolean;
  boundingRect: DOMRect | null;
  fallbackReason: string;
  isPartiallyVisible: boolean;
  isFullyVisible: boolean;
}

/**
 * Check if an element is visible in the viewport
 */
function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // Check if element is within viewport bounds
  const isInViewport =
    rect.top >= 0 && rect.left >= 0 && rect.bottom <= windowHeight && rect.right <= windowWidth;

  // Check if element has visible dimensions
  const hasVisibleSize = rect.width > 0 && rect.height > 0;

  // Check if element is visible (not display:none or visibility:hidden)
  const computedStyle = window.getComputedStyle(element);
  const isVisible =
    computedStyle.display !== "none" &&
    computedStyle.visibility !== "hidden" &&
    computedStyle.opacity !== "0";

  return isInViewport && hasVisibleSize && isVisible;
}

/**
 * Check if an element is at least partially visible in the viewport
 */
function isElementPartiallyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // Check if at least part of the element is in viewport
  const isPartiallyInViewport =
    rect.bottom > 0 && rect.right > 0 && rect.top < windowHeight && rect.left < windowWidth;

  // Check if element has visible dimensions
  const hasVisibleSize = rect.width > 0 && rect.height > 0;

  // Check if element is visible (not display:none or visibility:hidden)
  const computedStyle = window.getComputedStyle(element);
  const isVisible =
    computedStyle.display !== "none" &&
    computedStyle.visibility !== "hidden" &&
    computedStyle.opacity !== "0";

  return isPartiallyInViewport && hasVisibleSize && isVisible;
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
  forceFallback = false,
  debugMode = false,
}: CoachMarkProps) {
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = React.useState(false);
  const [useFallbackModal, setUseFallbackModal] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<DebugInfo>({
    targetSelector: targetSelector || "ref",
    targetFound: false,
    boundingRect: null,
    fallbackReason: "",
    isPartiallyVisible: false,
    isFullyVisible: false,
  });

  // Check for environment-based debug mode or force fallback
  const isDebugMode = debugMode || process.env.NEXT_PUBLIC_COACHMARK_DEBUG === "true";
  const shouldForceFallback =
    forceFallback || process.env.NEXT_PUBLIC_COACHMARK_FORCE_FALLBACK === "true";

  // Lock body scroll when visible
  useBodyScrollLock(isVisible);

  // Handle keyboard events
  React.useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      } else if (e.key === "Enter") {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onSkip, onNext]);

  // Cleanup effect to ensure all locks and listeners are removed when component unmounts
  React.useEffect(() => {
    return () => {
      // Ensure body scroll is restored
      document.body.style.overflow = "";

      // Note: We don't remove overlays here as React will handle unmounting them
      // This cleanup is just to ensure scroll state is restored
    };
  }, []); // Only run on mount/unmount

  React.useEffect(() => {
    if (!isVisible) {
      setIsReady(false);
      setUseFallbackModal(false);
      setDebugInfo({
        targetSelector: targetSelector || "ref",
        targetFound: false,
        boundingRect: null,
        fallbackReason: "",
        isPartiallyVisible: false,
        isFullyVisible: false,
      });
      return;
    }

    // Force fallback if enabled
    if (shouldForceFallback) {
      if (isDebugMode) {
        console.log("[CoachMark] Force fallback mode enabled");
      }
      setUseFallbackModal(true);
      setDebugInfo({
        targetSelector: targetSelector || "ref",
        targetFound: false,
        boundingRect: null,
        fallbackReason: "Force fallback mode enabled",
        isPartiallyVisible: false,
        isFullyVisible: false,
      });
      setIsReady(true);
      return;
    }

    const updatePosition = () => {
      let element: HTMLElement | null = null;

      if (targetRef?.current) {
        element = targetRef.current;
      } else if (targetSelector) {
        element = document.querySelector(targetSelector);
      }

      // Debug logging
      if (!element) {
        const reason = `Target not found - targetSelector: ${targetSelector || "none"}, targetRef: ${targetRef ? "provided" : "none"}`;
        if (isDebugMode) {
          console.warn(`[CoachMark] ${reason}`);
          console.log("[CoachMark] Falling back to centered modal");
        }
        setUseFallbackModal(true);
        setDebugInfo({
          targetSelector: targetSelector || "ref",
          targetFound: false,
          boundingRect: null,
          fallbackReason: reason,
          isPartiallyVisible: false,
          isFullyVisible: false,
        });
        setIsReady(true);
        return;
      }

      const rect = element.getBoundingClientRect();

      // Check if element is visible in viewport
      const isPartiallyVisible = isElementPartiallyVisible(element);
      const isFullyVisible = isElementInViewport(element);

      if (isDebugMode) {
        console.log(
          `[CoachMark] Target element found - selector: ${targetSelector || "ref"}, partially visible: ${isPartiallyVisible}, fully visible: ${isFullyVisible}`
        );
        console.log(`[CoachMark] Bounding rect:`, rect);
      }

      if (!isPartiallyVisible) {
        const reason = "Target element is not visible in viewport";
        if (isDebugMode) {
          console.warn(`[CoachMark] ${reason}`);
          console.log("[CoachMark] Falling back to centered modal");
        }
        setUseFallbackModal(true);
        setDebugInfo({
          targetSelector: targetSelector || "ref",
          targetFound: true,
          boundingRect: rect,
          fallbackReason: reason,
          isPartiallyVisible,
          isFullyVisible,
        });
        setIsReady(true);
        return;
      }

      // Element exists and is at least partially visible, use anchored positioning
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      setUseFallbackModal(false);
      setDebugInfo({
        targetSelector: targetSelector || "ref",
        targetFound: true,
        boundingRect: rect,
        fallbackReason: "",
        isPartiallyVisible,
        isFullyVisible,
      });
      setIsReady(true);

      // Only scroll into view if element is not fully visible
      if (!isFullyVisible && isPartiallyVisible) {
        if (isDebugMode) {
          console.log("[CoachMark] Scrolling element into view");
        }
        // Scroll element into view, respecting reduced motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, targetRef, targetSelector, shouldForceFallback, isDebugMode]);

  if (!isVisible || !isReady) return null;

  // Render centered modal fallback if target not found or not visible
  if (useFallbackModal) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        data-coachmark-overlay="true"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onSkip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && onSkip()}
          aria-label="Klicken Sie zum Überspringen der Tour"
        />

        {/* Centered Modal */}
        <div className="animate-scale-in relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {/* Content */}
          <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{description}</p>

          {/* Debug Information - Only shown in debug mode */}
          {isDebugMode && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-950">
              <div className="mb-1 font-semibold text-amber-900 dark:text-amber-100">
                🔍 Debug Information
              </div>
              <div className="space-y-1 text-amber-800 dark:text-amber-200">
                <div>
                  <span className="font-medium">Target:</span> {debugInfo.targetSelector}
                </div>
                <div>
                  <span className="font-medium">Found:</span>{" "}
                  {debugInfo.targetFound ? "✓ Yes" : "✗ No"}
                </div>
                {debugInfo.targetFound && (
                  <>
                    <div>
                      <span className="font-medium">Partially Visible:</span>{" "}
                      {debugInfo.isPartiallyVisible ? "✓ Yes" : "✗ No"}
                    </div>
                    <div>
                      <span className="font-medium">Fully Visible:</span>{" "}
                      {debugInfo.isFullyVisible ? "✓ Yes" : "✗ No"}
                    </div>
                  </>
                )}
                {debugInfo.boundingRect && (
                  <div>
                    <span className="font-medium">Rect:</span> (
                    {Math.round(debugInfo.boundingRect.top)},{" "}
                    {Math.round(debugInfo.boundingRect.left)}){" "}
                    {Math.round(debugInfo.boundingRect.width)}×
                    {Math.round(debugInfo.boundingRect.height)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Fallback Reason:</span> {debugInfo.fallbackReason}
                </div>
              </div>
            </div>
          )}

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
      </div>
    );
  }

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
      <div
        className="fixed inset-0 z-[90]"
        onClick={onSkip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onSkip()}
        aria-label="Klicken Sie zum Überspringen der Tour"
        data-coachmark-overlay="true"
      >
        {/* Dark overlay with cutout */}
        <svg className="h-full w-full" aria-hidden="true">
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
