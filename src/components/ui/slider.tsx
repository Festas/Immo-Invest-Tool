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
  ({ className, label, min, max, step = 1, value, onChange, formatValue, helpText, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
              </label>
              {helpText && <HelpTooltip content={helpText} />}
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        )}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full shadow-inner" />
            <div 
              className="absolute h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-150 shadow-sm"
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
              "w-full h-2.5 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10",
              className
            )}
            {...props}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
