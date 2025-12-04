import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";
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

    return (
      <div className="w-full">
        {label && (
          <div className="mb-2 flex items-center gap-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {label}
            </label>
            {helpText && <HelpTooltip content={helpText} />}
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
              "flex h-12 w-full rounded-xl px-4 py-3 text-sm font-medium",
              "bg-white dark:!bg-slate-800",
              "border-2 border-slate-200 dark:!border-slate-600",
              "text-slate-900 dark:!text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-400",
              "ring-offset-white dark:ring-offset-slate-900",
              "focus-visible:border-indigo-500 focus-visible:outline-none dark:focus-visible:border-indigo-400",
              "focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/20",
              "hover:border-slate-300 dark:hover:border-slate-500",
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
                  ? "border-slate-300/50 bg-slate-200 text-slate-600 dark:border-slate-500/50 dark:!bg-slate-600 dark:text-slate-200"
                  : "border-slate-200/50 bg-slate-100 text-slate-500 dark:border-slate-600/50 dark:!bg-slate-700 dark:text-slate-300"
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
