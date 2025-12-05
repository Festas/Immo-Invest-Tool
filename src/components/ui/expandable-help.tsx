"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface HelpButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function HelpButton({ isExpanded, onToggle }: HelpButtonProps) {
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

export function ExpandableHelpContent({ content, isExpanded }: ExpandableHelpContentProps) {
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
