import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  prefix?: string;
  error?: string;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, suffix, prefix, error, helpText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center gap-1.5 mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {label}
            </label>
            {helpText && <HelpTooltip content={helpText} />}
          </div>
        )}
        <div className="relative group">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
              {prefix}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl px-4 py-3 text-sm font-medium",
              "bg-white dark:bg-slate-900/80",
              "border-2 border-slate-200 dark:border-slate-700",
              "text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "ring-offset-white dark:ring-offset-slate-950",
              "focus-visible:outline-none focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400",
              "focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/20",
              "hover:border-slate-300 dark:hover:border-slate-600",
              "transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
              prefix && "pl-10",
              suffix && "pr-14",
              error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
