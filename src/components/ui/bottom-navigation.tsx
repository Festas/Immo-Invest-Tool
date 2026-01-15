"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "./sheet";
import { NAVIGATION_CATEGORIES } from "@/lib/constants/navigation";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function BottomNavigation({ activeTab, onTabChange, className }: BottomNavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [activeSheet, setActiveSheet] = React.useState<string | null>(null);

  // Determine which category the active tab belongs to
  const activeCategoryId = React.useMemo(() => {
    return NAVIGATION_CATEGORIES.find((cat) => cat.items.some((item) => item.value === activeTab))
      ?.id;
  }, [activeTab]);

  const handleNavClick = (value: string) => {
    onTabChange(value);
    setIsMoreOpen(false);
    setActiveSheet(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveSheet(categoryId);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Fixed to bottom, visible only on mobile */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 md:hidden",
          "border-t border-indigo-100/50 bg-white/95 backdrop-blur-xl dark:border-indigo-900/30 dark:bg-slate-900/95",
          "shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]",
          "safe-area-bottom",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-[70px] items-stretch justify-around">
          {/* Category Buttons */}
          {NAVIGATION_CATEGORIES.map((category) => {
            const isActive = activeCategoryId === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                aria-label={category.label}
                className={cn(
                  "flex min-w-[48px] flex-1 flex-col items-center justify-center gap-1 px-2",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-expanded={activeSheet === category.id}
                aria-haspopup="dialog"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-all duration-200",
                    isActive && "bg-indigo-100 shadow-sm dark:bg-indigo-900/50"
                  )}
                >
                  <span aria-hidden="true">{category.emoji}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-none font-medium",
                    isActive && "font-semibold"
                  )}
                  aria-hidden="true"
                >
                  {category.label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            aria-label="Alle Funktionen"
            className={cn(
              "flex min-w-[48px] flex-1 flex-col items-center justify-center gap-1 px-2",
              "transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
              "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            )}
            aria-expanded={isMoreOpen}
            aria-haspopup="dialog"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200"
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[10px] leading-none font-medium" aria-hidden="true">
              Mehr
            </span>
          </button>
        </div>
      </nav>

      {/* Category Sheets */}
      {NAVIGATION_CATEGORIES.map((category) => (
        <Sheet
          key={category.id}
          open={activeSheet === category.id}
          onOpenChange={(open) => !open && setActiveSheet(null)}
        >
          <SheetContent side="bottom" className="max-h-[60vh]">
            <SheetHeader>
              <SheetTitle>
                <span className="mr-2" aria-hidden="true">
                  {category.emoji}
                </span>
                {category.label}
              </SheetTitle>
              <SheetClose />
            </SheetHeader>

            <div className="grid grid-cols-2 gap-3 px-4 pb-8">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() => handleNavClick(item.value)}
                    aria-label={item.label}
                    className={cn(
                      "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl p-4",
                      "transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
                      isActive
                        ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300"
                        : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className="text-center text-sm font-medium" aria-hidden="true">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-center text-xs opacity-75" aria-hidden="true">
                        {item.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      ))}

      {/* "More" Sheet - All functions */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Alle Funktionen</SheetTitle>
            <SheetClose />
          </SheetHeader>

          <div className="space-y-6 px-4 pb-8">
            {NAVIGATION_CATEGORIES.map((category) => (
              <div key={category.id}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span aria-hidden="true">{category.emoji}</span>
                  {category.label}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;

                    return (
                      <button
                        key={item.value}
                        onClick={() => handleNavClick(item.value)}
                        aria-label={item.label}
                        className={cn(
                          "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg p-3",
                          "transition-all duration-200",
                          "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
                          isActive
                            ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300"
                            : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-center text-xs leading-tight font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
