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

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  helpText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, onChange, value, helpText, ...props }, ref) => {
    const [isHelpExpanded, setIsHelpExpanded] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <div className="mb-2 flex items-center gap-1.5">
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
        )}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "flex h-12 w-full cursor-pointer rounded-lg px-4 py-3 text-sm font-medium",
            "bg-white dark:bg-slate-800",
            "border-2 border-slate-200 dark:border-slate-600",
            "text-slate-900 dark:text-slate-100",
            "ring-offset-white dark:ring-offset-slate-900",
            "focus-visible:border-indigo-500 focus-visible:outline-none dark:focus-visible:border-indigo-400",
            "focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/20",
            "hover:border-slate-300 dark:hover:border-slate-500",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 dark:disabled:bg-slate-700",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Mobile: Inline expandable help text below select */}
        {helpText && <ExpandableHelpContent content={helpText} isExpanded={isHelpExpanded} />}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
