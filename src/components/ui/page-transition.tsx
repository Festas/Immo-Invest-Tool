"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Unique key to identify the page/tab
   * When this changes, the transition is triggered
   */
  pageKey: string;
  /**
   * Animation type
   */
  type?: "fade" | "slide";
  /**
   * Duration in milliseconds
   */
  duration?: number;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * PageTransition component for smooth transitions between pages or tabs
 * Fades out old content and fades in new content
 */
export function PageTransition({
  children,
  pageKey,
  type = "fade",
  duration = 300,
  className,
}: PageTransitionProps) {
  const [displayedContent, setDisplayedContent] = React.useState(children);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const previousPageKey = React.useRef(pageKey);

  React.useEffect(() => {
    // Check if page key changed
    if (previousPageKey.current === pageKey) {
      // Same page, just update content
      setDisplayedContent(children);
      return;
    }

    // Check for reduced motion preference
    if (shouldReduceMotion()) {
      setDisplayedContent(children);
      previousPageKey.current = pageKey;
      return;
    }

    // Page key changed, trigger transition
    setIsTransitioning(true);

    // Wait for fade out, then update content
    const timeout = setTimeout(() => {
      setDisplayedContent(children);
      previousPageKey.current = pageKey;
      setIsTransitioning(false);
    }, duration / 2);

    return () => clearTimeout(timeout);
  }, [pageKey, children, duration]);

  return (
    <div
      className={cn(
        "transition-all",
        type === "fade" && "transition-opacity",
        type === "slide" && "transition-all",
        isTransitioning && type === "fade" && "opacity-0",
        isTransitioning && type === "slide" && "translate-x-4 opacity-0",
        !isTransitioning && "translate-x-0 opacity-100",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "ease-out",
      }}
    >
      {displayedContent}
    </div>
  );
}

/**
 * CrossfadeTransition component for crossfading between two states
 * Useful for switching between different content while maintaining layout
 */
interface CrossfadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  duration?: number;
  className?: string;
}

export function CrossfadeTransition({
  show,
  children,
  fallback = null,
  duration = 300,
  className,
}: CrossfadeTransitionProps) {
  const [displayedContent, setDisplayedContent] = React.useState(show ? children : fallback);
  const [isVisible, setIsVisible] = React.useState(show);

  React.useEffect(() => {
    // Check for reduced motion preference
    if (shouldReduceMotion()) {
      setDisplayedContent(show ? children : fallback);
      setIsVisible(show);
      return;
    }

    if (show !== isVisible) {
      // Fade out
      setIsVisible(false);

      // Wait for fade out, then switch content and fade in
      const timeout = setTimeout(() => {
        setDisplayedContent(show ? children : fallback);
        // Small delay to ensure DOM update before fading in
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [show, children, fallback, duration, isVisible]);

  return (
    <div
      className={cn("transition-opacity", isVisible ? "opacity-100" : "opacity-0", className)}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "ease-out",
      }}
    >
      {displayedContent}
    </div>
  );
}
