"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmoCalcStore } from "@/store";
import { NAVIGATION_CATEGORIES, getCategoryForTab } from "@/lib/constants/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar, setCurrentCategory } =
    useImmoCalcStore();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(["analyse"])
  );

  // Update current category when active tab changes
  React.useEffect(() => {
    const category = getCategoryForTab(activeTab);
    if (category) {
      setCurrentCategory(category.id);
      // Auto-expand the category of the active tab
      setExpandedCategories((prev) => new Set([...prev, category.id]));
    }
  }, [activeTab, setCurrentCategory]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <aside
      role="navigation"
      aria-label="Hauptnavigation"
      className={cn(
        "fixed top-0 left-0 z-40 h-screen border-r border-indigo-100/50 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out dark:border-indigo-900/30 dark:bg-slate-900/95",
        "hidden md:flex md:flex-col",
        "shadow-[4px_0_20px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.3)]",
        sidebarCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      {/* Header with toggle button */}
      <div
        className={cn(
          "flex items-center border-b border-indigo-100/50 p-4 dark:border-indigo-900/30",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed && (
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Navigation</h2>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Navigation erweitern" : "Navigation einklappen"}
          className={cn(
            "rounded-lg p-2 text-slate-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600",
            "dark:text-slate-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400",
            "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation categories */}
      <nav className="flex-1 overflow-x-hidden overflow-y-auto py-4" aria-label="Kategorien">
        <div className="space-y-2 px-2">
          {NAVIGATION_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some((item) => item.value === activeTab);

            return (
              <div key={category.id} className="space-y-1">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                    "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
                    hasActiveItem
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="text-lg" aria-hidden="true">
                    {category.emoji}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{category.label}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                {/* Category items */}
                {isExpanded && (
                  <div
                    className={cn(
                      "space-y-1 overflow-hidden transition-all duration-200",
                      sidebarCollapsed ? "hidden" : "ml-2"
                    )}
                  >
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.value;

                      return (
                        <button
                          key={item.value}
                          onClick={() => setActiveTab(item.value)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                            "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
                            isActive
                              ? "bg-indigo-100 font-medium text-indigo-700 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300"
                              : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Collapsed state - show items on hover */}
                {sidebarCollapsed && (
                  <div className="group relative">
                    <div
                      className={cn(
                        "invisible absolute top-0 left-full z-50 ml-2 w-48 rounded-lg border border-indigo-100/50 bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-indigo-900/30 dark:bg-slate-900",
                        "pointer-events-none group-hover:pointer-events-auto"
                      )}
                    >
                      <div className="mb-2 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {category.label}
                      </div>
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.value;

                          return (
                            <button
                              key={item.value}
                              onClick={() => setActiveTab(item.value)}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
                                isActive
                                  ? "bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer hint */}
      {!sidebarCollapsed && (
        <div className="border-t border-indigo-100/50 p-4 dark:border-indigo-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              Cmd
            </kbd>{" "}
            +{" "}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              K
            </kbd>{" "}
            für Schnellsuche
          </p>
        </div>
      )}
    </aside>
  );
}
