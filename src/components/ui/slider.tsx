import * as React from "react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "./tooltip";

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

    return (
      <div className="w-full">
        {label && (
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
              </label>
              {helpText && <HelpTooltip content={helpText} />}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        )}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="h-2.5 w-full rounded-full bg-slate-200 shadow-inner dark:bg-slate-700" />
            <div
              className="absolute h-2.5 rounded-full bg-slate-600 shadow-sm transition-all duration-150 dark:bg-slate-500"
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
            className={cn(
              "relative z-10 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
              className
            )}
            {...props}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
