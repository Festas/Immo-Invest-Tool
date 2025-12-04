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
          <HelpCircle
            className="h-4 w-4 text-slate-400 transition-colors duration-200 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400"
            aria-hidden="true"
          />
        )}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2",
            "px-4 py-3 text-sm",
            "bg-slate-900 text-white dark:bg-slate-800",
            "rounded-lg shadow-xl shadow-black/20 dark:shadow-black/40",
            "w-max max-w-xs border border-slate-700/50 dark:border-slate-600/50",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          <div className="leading-relaxed whitespace-pre-wrap">{content}</div>
          {/* Arrow */}
          <div
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2",
              "border-8 border-transparent border-t-slate-900 dark:border-t-slate-800"
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
      <HelpCircle
        className="h-4 w-4 text-slate-400 transition-colors duration-200 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400"
        aria-hidden="true"
      />
    </Tooltip>
  );
}
