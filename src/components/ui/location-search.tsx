"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { searchLocations, PLZResult } from "@/lib/api/openplz";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  onSelect: (location: PLZResult) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({
  onSelect,
  placeholder = "PLZ oder Ort eingeben...",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PLZResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchLocations(query);
        setResults(data);
        setIsOpen(data.length > 0);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: PLZResult) => {
    setQuery(`${result.postalCode} ${result.name}`);
    setIsOpen(false);
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {results.map((result, index) => (
            <li
              key={`${result.postalCode}-${result.name}-${index}`}
              onClick={() => handleSelect(result)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                index === selectedIndex
                  ? "bg-indigo-50 dark:bg-indigo-900/30"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-indigo-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {result.postalCode} {result.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.district && `${result.district}, `}
                  {result.state}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
