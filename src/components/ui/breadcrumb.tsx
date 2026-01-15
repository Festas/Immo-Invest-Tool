"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <ol className="flex items-center space-x-1">
        {/* Home icon as first item */}
        <li>
          <button
            onClick={items[0]?.onClick}
            className={cn(
              "flex items-center rounded-lg p-1.5 transition-colors",
              "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
              "dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400",
              "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            )}
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Separator */}
              <li>
                <ChevronRight
                  className="h-4 w-4 text-slate-400 dark:text-slate-600"
                  aria-hidden="true"
                />
              </li>

              {/* Breadcrumb item */}
              <li>
                {isLast ? (
                  // Last item - not clickable, shows current page
                  <span
                    className="truncate rounded-lg px-2 py-1.5 font-medium text-slate-900 dark:text-white"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Intermediate items - clickable
                  <button
                    onClick={item.onClick}
                    className={cn(
                      "truncate rounded-lg px-2 py-1.5 transition-colors",
                      "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
                      "dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400",
                      "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    )}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
