import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  helpText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, onChange, value, helpText, ...props }, ref) => {
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
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "flex h-12 w-full rounded-xl px-4 py-3 text-sm font-medium cursor-pointer",
            "bg-white dark:bg-slate-900/80",
            "border-2 border-slate-200 dark:border-slate-700",
            "text-slate-900 dark:text-slate-100",
            "ring-offset-white dark:ring-offset-slate-950",
            "focus-visible:outline-none focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400",
            "focus-visible:ring-4 focus-visible:ring-indigo-500/10 dark:focus-visible:ring-indigo-400/20",
            "hover:border-slate-300 dark:hover:border-slate-600",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
