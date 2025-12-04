"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHECKLIST_ITEMS, ChecklistItem } from "@/types";
import {
  ClipboardCheck,
  FileText,
  Search,
  Calculator,
  Scale,
  Wrench,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Trash2,
  Save,
} from "lucide-react";

const categoryIcons: Record<ChecklistItem["category"], React.ReactNode> = {
  DOKUMENTE: <FileText className="h-5 w-5" />,
  BESICHTIGUNG: <Search className="h-5 w-5" />,
  FINANZEN: <Calculator className="h-5 w-5" />,
  RECHTLICHES: <Scale className="h-5 w-5" />,
  TECHNISCH: <Wrench className="h-5 w-5" />,
};

const categoryLabels: Record<ChecklistItem["category"], string> = {
  DOKUMENTE: "Dokumente",
  BESICHTIGUNG: "Besichtigung",
  FINANZEN: "Finanzen",
  RECHTLICHES: "Rechtliches",
  TECHNISCH: "Technisch",
};

const categoryColors: Record<ChecklistItem["category"], string> = {
  DOKUMENTE: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  BESICHTIGUNG: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  FINANZEN: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  RECHTLICHES: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  TECHNISCH: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
};

export function DueDiligenceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dueDiligenceChecklist");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall back to default
        }
      }
    }
    return DEFAULT_CHECKLIST_ITEMS.map((item) => ({
      ...item,
      isCompleted: false,
      notes: "",
    }));
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistItem["category"]>>(
    new Set(["DOKUMENTE", "BESICHTIGUNG"])
  );

  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const toggleCategory = (category: ChecklistItem["category"]) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)));
  };

  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dueDiligenceChecklist", JSON.stringify(items));
    }
  };

  const resetChecklist = () => {
    const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item) => ({
      ...item,
      isCompleted: false,
      notes: "",
    }));
    setItems(defaultItems);
    if (typeof window !== "undefined") {
      localStorage.removeItem("dueDiligenceChecklist");
    }
  };

  const categories: ChecklistItem["category"][] = [
    "DOKUMENTE",
    "BESICHTIGUNG",
    "FINANZEN",
    "RECHTLICHES",
    "TECHNISCH",
  ];

  const getItemsByCategory = (category: ChecklistItem["category"]) =>
    items.filter((item) => item.category === category);

  const getCategoryProgress = (category: ChecklistItem["category"]) => {
    const categoryItems = getItemsByCategory(category);
    const completed = categoryItems.filter((item) => item.isCompleted).length;
    return { completed, total: categoryItems.length };
  };

  const totalProgress = {
    completed: items.filter((item) => item.isCompleted).length,
    total: items.length,
    requiredCompleted: items.filter((item) => item.isRequired && item.isCompleted).length,
    requiredTotal: items.filter((item) => item.isRequired).length,
  };

  const progressPercent = (totalProgress.completed / totalProgress.total) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <span>Due Diligence Checkliste</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
                <Save className="mr-1 h-4 w-4" />
                Speichern
              </Button>
              <Button variant="ghost" size="sm" onClick={resetChecklist}>
                <Trash2 className="mr-1 h-4 w-4" />
                Zurücksetzen
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Eine umfassende Checkliste für die Prüfung einer Immobilie vor dem Kauf. Arbeiten Sie
            alle Punkte ab, um Risiken zu minimieren.
          </p>

          {/* Progress Overview */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Gesamtfortschritt
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {totalProgress.completed} / {totalProgress.total} erledigt (
                {progressPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Pflichtpunkte: {totalProgress.requiredCompleted} / {totalProgress.requiredTotal}
              </span>
              {totalProgress.requiredCompleted < totalProgress.requiredTotal && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  Noch offene Pflichtpunkte
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      {categories.map((category) => {
        const progress = getCategoryProgress(category);
        const isExpanded = expandedCategories.has(category);
        const categoryItems = getItemsByCategory(category);

        return (
          <Card key={category}>
            <CardHeader
              className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => toggleCategory(category)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${categoryColors[category]}`}>
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100">
                      {categoryLabels[category]}
                    </span>
                    <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      {progress.completed} / {progress.total} erledigt
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          progress.total > 0 ? (progress.completed / progress.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-3 transition-all ${
                        item.isCompleted
                          ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-950/50"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-medium ${
                                item.isCompleted
                                  ? "text-slate-500 line-through dark:text-slate-400"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.isRequired && (
                              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/50 dark:text-red-400">
                                Pflicht
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {item.description}
                          </p>
                          {editingNotes === item.id ? (
                            <div className="mt-2">
                              <textarea
                                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                rows={2}
                                placeholder="Notizen hinzufügen..."
                                value={item.notes || ""}
                                onChange={(e) => updateNotes(item.id, e.target.value)}
                                onBlur={() => setEditingNotes(null)}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingNotes(item.id)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {item.notes ? `📝 ${item.notes}` : "📝 Notiz hinzufügen"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Summary */}
      {totalProgress.completed === totalProgress.total && (
        <Card className="bg-green-600 dark:bg-green-700">
          <CardContent className="py-6 text-center text-white">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-xl font-bold">🎉 Due Diligence abgeschlossen!</h3>
            <p className="text-green-100">
              Sie haben alle Prüfpunkte erfolgreich abgearbeitet. Sie sind gut vorbereitet für den
              Immobilienkauf.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
