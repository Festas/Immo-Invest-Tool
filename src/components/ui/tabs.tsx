import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
  tabsId: string;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  const tabsId = React.useId();
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange, tabsId }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      aria-label="Navigation"
      className={cn(
        "relative inline-flex h-12 items-center justify-center gap-1 rounded-xl p-1.5",
        "bg-slate-100/90 backdrop-blur-sm dark:bg-slate-800/90",
        "border border-indigo-100/50 dark:border-indigo-900/30",
        "shadow-inner shadow-slate-200/50 dark:shadow-black/20",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;
    const triggerId = `${context.tabsId}-tab-${value}`;
    const panelId = `${context.tabsId}-panel-${value}`;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={triggerId}
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        onClick={() => context.onChange(value)}
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap",
          "ring-offset-white dark:ring-offset-slate-950",
          "transition-all duration-300 ease-out",
          "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "border border-indigo-200/50 bg-white text-indigo-700 shadow-md shadow-indigo-100/50 dark:border-indigo-700/50 dark:bg-slate-900 dark:text-indigo-300 dark:shadow-black/30"
            : "text-slate-600 hover:bg-white/50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-indigo-400",
          className
        )}
        {...props}
      >
        <span className={cn("relative z-10 flex items-center gap-2", isActive && "font-semibold")}>
          {children}
        </span>
        {isActive && (
          <span
            className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"
            style={{
              animation: "tabIndicator 0.3s ease-out forwards",
            }}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    const triggerId = `${context.tabsId}-tab-${value}`;
    const panelId = `${context.tabsId}-panel-${value}`;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={triggerId}
        tabIndex={0}
        className={cn(
          "mt-4 ring-offset-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          "animate-fade-in",
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
