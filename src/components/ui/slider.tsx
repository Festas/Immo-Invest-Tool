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
    const [isHovered, setIsHovered] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);

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
        <div
          className="relative py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 flex items-center">
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
              "relative z-10 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
              className
            )}
            {...props}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">{formatValue ? formatValue(min) : min}</span>
          <span className="tabular-nums">{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
