"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: AccordionType;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

interface AccordionProps {
  type?: AccordionType;
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = "single", defaultValue, children, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        }
        return prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value];
      });
    },
    [type]
  );

  const contextValue = React.useMemo(
    () => ({ openItems, toggleItem, type }),
    [openItems, toggleItem, type]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined);

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionItem components must be used within an AccordionItem");
  }
  return context;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.includes(value);

  const contextValue = React.useMemo(() => ({ value, isOpen }), [value, isOpen]);

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div className={cn("overflow-hidden", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between p-4 sm:p-6",
        "bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-800/50",
        "text-left font-bold text-slate-900 dark:text-white",
        "min-h-[56px] touch-manipulation",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        "transition-colors hover:from-indigo-100 hover:to-slate-100 dark:hover:from-indigo-950/50 dark:hover:to-slate-800/70",
        className
      )}
      aria-expanded={isOpen}
    >
      <span className="flex items-center gap-3 text-base">{children}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400",
          "transition-transform duration-300 ease-out",
          "motion-reduce:transition-none",
          isOpen && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { isOpen } = useAccordionItemContext();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(isOpen ? undefined : 0);

  React.useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    });

    resizeObserver.observe(contentRef.current);

    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }

    return () => resizeObserver.disconnect();
  }, [isOpen]);

  return (
    <div
      className={cn(
        "overflow-hidden transition-[height] duration-300 ease-out",
        "motion-reduce:transition-none"
      )}
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
      aria-hidden={!isOpen}
    >
      <div ref={contentRef} className={cn("p-4 pt-0 sm:p-6 sm:pt-0", className)}>
        {children}
      </div>
    </div>
  );
}
