"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Calculator,
  BarChart3,
  GitCompare,
  LayoutDashboard,
  MoreHorizontal,
  TrendingUp,
  Target,
  Wrench,
  LogOut,
  MapPin,
  ClipboardCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "./sheet";

// Primary navigation items (shown in bottom bar)
const primaryNavItems = [
  { value: "calculator", label: "Rechner", icon: Calculator },
  { value: "charts", label: "Charts", icon: BarChart3 },
  { value: "comparison", label: "Vergleich", icon: GitCompare },
  { value: "dashboard", label: "Portfolio", icon: LayoutDashboard },
] as const;

// Secondary navigation items (shown in "More" drawer)
const secondaryNavItems = [
  { value: "rent-index", label: "Mietspiegel", icon: TrendingUp },
  { value: "break-even", label: "Break-Even", icon: Target },
  { value: "renovation", label: "Renovierung", icon: Wrench },
  { value: "exit-strategy", label: "Exit", icon: LogOut },
  { value: "location", label: "Standort", icon: MapPin },
  { value: "checklist", label: "Checkliste", icon: ClipboardCheck },
] as const;

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function BottomNavigation({ activeTab, onTabChange, className }: BottomNavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  // Check if a secondary nav item is active
  const isSecondaryActive = secondaryNavItems.some((item) => item.value === activeTab);

  const handleNavClick = (value: string) => {
    onTabChange(value);
    setIsMoreOpen(false);
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
          {/* Primary Navigation Items */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;

            return (
              <button
                key={item.value}
                onClick={() => handleNavClick(item.value)}
                aria-label={item.label}
                className={cn(
                  "flex min-w-[48px] flex-1 flex-col items-center justify-center gap-1 px-2",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                    isActive && "bg-indigo-100 shadow-sm dark:bg-indigo-900/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-none font-medium",
                    isActive && "font-semibold"
                  )}
                  aria-hidden="true"
                >
                  {item.label}
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
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <button
              onClick={() => setIsMoreOpen(true)}
              aria-label="Weitere Funktionen"
              className={cn(
                "flex min-w-[48px] flex-1 flex-col items-center justify-center gap-1 px-2",
                "transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-inset",
                isSecondaryActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              )}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  isSecondaryActive && "bg-indigo-100 shadow-sm dark:bg-indigo-900/50"
                )}
              >
                <MoreHorizontal
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isSecondaryActive && "scale-110"
                  )}
                  aria-hidden="true"
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none font-medium",
                  isSecondaryActive && "font-semibold"
                )}
                aria-hidden="true"
              >
                Mehr
              </span>
              {isSecondaryActive && (
                <span
                  className="absolute bottom-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Secondary Navigation Drawer */}
            <SheetContent side="bottom" className="max-h-[60vh]">
              <SheetHeader>
                <SheetTitle>Weitere Funktionen</SheetTitle>
                <SheetClose />
              </SheetHeader>

              <div className="grid grid-cols-3 gap-3 px-4 pb-8">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;

                  return (
                    <button
                      key={item.value}
                      onClick={() => handleNavClick(item.value)}
                      aria-label={item.label}
                      className={cn(
                        "flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-xl p-4",
                        "transition-all duration-200",
                        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
                        isActive
                          ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300"
                          : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      <span className="text-xs font-medium" aria-hidden="true">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
