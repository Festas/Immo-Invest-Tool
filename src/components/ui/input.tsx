"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";
import { HelpButton, ExpandableHelpContent } from "./expandable-help";
import { Check, AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  prefix?: string;
  error?: string;
  helpText?: string;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, suffix, prefix, error, helpText, success, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
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
        <div className="group relative">
          {prefix && (
            <span
              className={cn(
                "absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium transition-colors",
                isFocused
                  ? "text-slate-600 dark:text-slate-300"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {prefix}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-lg px-4 py-3 text-sm font-medium",
              "bg-[var(--input)]",
              "border-2 border-[var(--input-border)]",
              "text-[var(--foreground)]",
              "placeholder:text-slate-400 dark:placeholder:text-slate-400",
              "ring-offset-[var(--background)]",
              "focus-visible:border-indigo-500 focus-visible:outline-none dark:focus-visible:border-indigo-400",
              "focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/20",
              "hover:border-[var(--border-hover)]",
              "transition-all duration-200",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 dark:disabled:bg-slate-700",
              prefix && "pl-10",
              suffix && "pr-14",
              error &&
                "animate-shake border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
              success && "border-green-500 focus-visible:border-green-500",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {suffix && (
            <span
              className={cn(
                "absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border px-2 py-1 text-sm font-medium transition-colors",
                isFocused
                  ? "border-[var(--border)] bg-[var(--surface-3)] text-[var(--foreground-secondary)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)]"
              )}
            >
              {suffix}
            </span>
          )}
          {/* Success/Error indicators */}
          {success && !error && (
            <span className="animate-scale-in absolute top-1/2 right-4 -translate-y-1/2">
              <Check className="h-5 w-5 text-green-500" />
            </span>
          )}
          {error && (
            <span className="animate-scale-in absolute top-1/2 right-4 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </span>
          )}
        </div>
        {/* Mobile: Inline expandable help text below input */}
        {helpText && <ExpandableHelpContent content={helpText} isExpanded={isHelpExpanded} />}
        {error && (
          <p className="animate-fade-in mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
