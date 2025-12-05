"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableCardsProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
}

/**
 * Horizontal swipe container with snap scrolling and dot indicators
 * Designed for mobile touch interactions with smooth scrolling behavior
 */
function SwipeableCards({
  children,
  className,
  showArrows = true,
  showDots = true,
}: SwipeableCardsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);
  const childCount = React.Children.count(children);

  const handleScroll = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);

    // Update arrow visibility
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < container.scrollWidth - container.offsetWidth - 10);
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.offsetWidth;
    container.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });
  };

  const scrollLeft = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const scrollRight = () => {
    if (activeIndex < childCount - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="min-w-full flex-shrink-0 snap-center">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && childCount > 1 && (
        <>
          <button
            onClick={scrollLeft}
            className={cn(
              "absolute top-1/2 left-0 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all duration-200 dark:bg-slate-800/90",
              "hover:bg-white hover:shadow-xl dark:hover:bg-slate-700",
              "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
              showLeftArrow ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={scrollRight}
            className={cn(
              "absolute top-1/2 right-0 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all duration-200 dark:bg-slate-800/90",
              "hover:bg-white hover:shadow-xl dark:hover:bg-slate-700",
              "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
              showRightArrow ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-label="Next card"
          >
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && childCount > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: childCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200",
                "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
                index === activeIndex
                  ? "w-4 bg-indigo-600 dark:bg-indigo-400"
                  : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
              )}
              aria-label={`Go to card ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SwipeCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Individual card to be used within SwipeableCards
 */
function SwipeCard({ children, className }: SwipeCardProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

interface DotIndicatorsProps {
  current: number;
  total: number;
  className?: string;
  onDotClick?: (index: number) => void;
}

/**
 * Standalone dot indicators component
 */
function DotIndicators({ current, total, className, onDotClick }: DotIndicatorsProps) {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick?.(index)}
          className={cn(
            "h-2 rounded-full transition-all duration-200",
            "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
            index === current
              ? "w-4 bg-indigo-600 dark:bg-indigo-400"
              : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
          )}
          aria-label={`Go to item ${index + 1}`}
          aria-current={index === current ? "true" : undefined}
          disabled={!onDotClick}
        />
      ))}
    </div>
  );
}

export { SwipeableCards, SwipeCard, DotIndicators };
export type { SwipeableCardsProps, SwipeCardProps, DotIndicatorsProps };
