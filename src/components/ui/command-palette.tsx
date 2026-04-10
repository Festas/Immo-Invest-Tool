"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmoCalcStore } from "@/store";
import {
  ALL_NAVIGATION_ITEMS,
  getCategoryForTab,
  NAVIGATION_SHORTCUTS,
} from "@/lib/constants/navigation";
import { Search, ArrowUp, Clock } from "lucide-react";

interface CommandPaletteProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({
  className,
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const { setActiveTab, recentTabs } = useImmoCalcStore();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === "function" ? value(isOpen) : value;
      if (onOpenChange) {
        onOpenChange(newValue);
      } else {
        setInternalOpen(newValue);
      }
    },
    [isOpen, onOpenChange]
  );

  // Handler for selecting an item
  const handleSelectItem = React.useCallback(
    (value: string) => {
      setActiveTab(value);
      setIsOpen(false);
      setSearchQuery("");
      setSelectedIndex(0);
    },
    [setActiveTab, setIsOpen]
  );

  // Fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    let queryIndex = 0;
    for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === normalizedQuery.length;
  };

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_NAVIGATION_ITEMS;
    }

    return ALL_NAVIGATION_ITEMS.filter(
      (item) =>
        fuzzyMatch(item.label, searchQuery) ||
        (item.description && fuzzyMatch(item.description, searchQuery))
    );
  }, [searchQuery]);

  // Get recent items (max 3)
  const recentItems = React.useMemo(() => {
    return recentTabs
      .slice(0, 3)
      .map((tabValue) => ALL_NAVIGATION_ITEMS.find((item) => item.value === tabValue))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }, [recentTabs]);

  // Keyboard shortcut to open/close palette (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  // Handle navigation within the palette
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
        setSelectedIndex(0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelectItem(filteredItems[selectedIndex].value);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelectItem, setIsOpen]);

  // Focus search input when opening
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-[200] flex items-start justify-center", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Schnellsuche"
        className={cn(
          "animate-scale-up relative mt-[15vh] w-full max-w-2xl rounded-2xl border border-indigo-100/50 bg-white shadow-2xl dark:border-indigo-900/30 dark:bg-slate-900",
          "overflow-hidden"
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-indigo-100/50 px-4 py-4 dark:border-indigo-900/30">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Funktion suchen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className={cn(
              "flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
            )}
            aria-label="Suche"
          />
          <kbd className="hidden rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 sm:inline-block dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {/* Recent items */}
          {!searchQuery && recentItems.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kürzlich verwendet</span>
              </div>
              <div className="space-y-1">
                {recentItems.map((item) => {
                  const Icon = item.icon;
                  const category = getCategoryForTab(item.value);
                  const shortcut = NAVIGATION_SHORTCUTS[item.value];

                  return (
                    <button
                      key={item.value}
                      onClick={() => handleSelectItem(item.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      )}
                    >
                      <Icon
                        className="h-5 w-5 text-slate-600 dark:text-slate-400"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {category && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {category.label}
                        </span>
                      )}
                      {shortcut && (
                        <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All items / Search results */}
          {filteredItems.length > 0 ? (
            <div>
              {!searchQuery && recentItems.length > 0 && (
                <div className="mb-2 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Alle Funktionen
                </div>
              )}
              <div className="space-y-1">
                {filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const category = getCategoryForTab(item.value);
                  const shortcut = NAVIGATION_SHORTCUTS[item.value];
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.value}
                      onClick={() => handleSelectItem(item.value)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-indigo-100 dark:bg-indigo-900/50"
                          : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isSelected
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400"
                        )}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "font-medium",
                            isSelected
                              ? "text-indigo-900 dark:text-indigo-100"
                              : "text-slate-900 dark:text-white"
                          )}
                        >
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {category && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {category.label}
                        </span>
                      )}
                      {shortcut && (
                        <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keine Ergebnisse gefunden
              </p>
            </div>
          )}
        </div>

        {/* Footer with hint */}
        <div className="flex items-center justify-between border-t border-indigo-100/50 px-4 py-2 text-xs text-slate-500 dark:border-indigo-900/30 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
              <span>↓</span>
              <span className="ml-1">navigieren</span>
            </span>
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">↵</kbd>{" "}
              auswählen
            </span>
          </div>
          <span>
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">ESC</kbd>{" "}
            schließen
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook to control command palette from anywhere
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
