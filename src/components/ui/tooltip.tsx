"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsVisible(!isVisible);
    } else if (e.key === "Escape") {
      setIsVisible(false);
    }
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onKeyDown={handleKeyDown}
        className="cursor-help"
        tabIndex={0}
        role="button"
        aria-label="Hilfe anzeigen"
        aria-describedby={isVisible ? "tooltip" : undefined}
      >
        {children || (
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" aria-hidden="true" />
        )}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={cn(
            "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2",
            "px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700",
            "rounded-lg shadow-lg max-w-xs w-max",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          {/* Arrow */}
          <div
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2",
              "border-8 border-transparent border-t-gray-900 dark:border-t-gray-700"
            )}
          />
        </div>
      )}
    </div>
  );
}

interface HelpTooltipProps {
  content: string;
  className?: string;
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <Tooltip content={content} className={className}>
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" aria-hidden="true" />
    </Tooltip>
  );
}
