import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  prefix?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, suffix, prefix, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {prefix}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
              "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-gray-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950",
              prefix && "pl-8",
              suffix && "pr-12",
              error && "border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
