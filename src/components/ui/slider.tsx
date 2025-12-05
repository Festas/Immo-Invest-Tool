"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";
import { Info } from "lucide-react";

interface HelpButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function HelpButton({ isExpanded, onToggle }: HelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center",
        "h-6 min-h-[24px] w-6 min-w-[24px]",
        "rounded-full",
        "text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400",
        "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
        "transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        "sm:hidden" // Only show on mobile, desktop uses tooltip
      )}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? "Hilfe ausblenden" : "Hilfe anzeigen"}
    >
      <Info className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

interface ExpandableHelpContentProps {
  content: string;
  isExpanded: boolean;
}

function ExpandableHelpContent({ content, isExpanded }: ExpandableHelpContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  return (
    <div
      className={cn(
        "overflow-hidden transition-[height,opacity] duration-300 ease-out",
        "motion-reduce:transition-none",
        "sm:hidden" // Only show on mobile
      )}
      style={{ height: `${height}px` }}
      aria-hidden={!isExpanded}
    >
      <div
        ref={contentRef}
        className={cn(
          "mt-2 rounded-lg p-3",
          "bg-slate-50 dark:bg-slate-800/50",
          "border border-slate-200 dark:border-slate-700/50",
          "text-sm leading-relaxed text-slate-600 dark:text-slate-300"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  helpText?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, label, min, max, step = 1, value, onChange, formatValue, helpText, ...props },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const [isHovered, setIsHovered] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isHelpExpanded, setIsHelpExpanded] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
              </label>
              {/* Desktop: Tooltip, Mobile: hidden (info button shown separately) */}
              {helpText && (
                <span className="hidden sm:inline-flex">
                  <HelpTooltip content={helpText} />
                </span>
              )}
              {/* Mobile: Info button for inline expansion */}
              {helpText && (
                <HelpButton
                  isExpanded={isHelpExpanded}
                  onToggle={() => setIsHelpExpanded(!isHelpExpanded)}
                />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums transition-all duration-200",
                isDragging
                  ? "scale-110 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-300"
              )}
            >
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        )}
        {/* Mobile: Inline expandable help text below label */}
        {helpText && <ExpandableHelpContent content={helpText} isExpanded={isHelpExpanded} />}
        <div
          className="relative touch-pan-y py-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center">
            <div
              className={cn(
                "h-2.5 w-full rounded-full shadow-inner transition-all duration-200",
                isHovered || isDragging
                  ? "bg-slate-300 dark:bg-slate-600"
                  : "bg-slate-200 dark:bg-slate-700"
              )}
            />
            <div
              className={cn(
                "absolute h-2.5 rounded-full shadow-sm transition-all duration-150",
                isDragging ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-600 dark:bg-slate-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className={cn(
              "relative z-10 h-12 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
              "touch-pan-y",
              className
            )}
            {...props}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">{formatValue ? formatValue(min) : min}</span>
          <span className="tabular-nums">{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
