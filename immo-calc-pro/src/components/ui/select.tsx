import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, onChange, value, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
            "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
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
