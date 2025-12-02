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

  const [expandedCategories, setExpandedCategories] = useState<
    Set<ChecklistItem["category"]>
  >(new Set(["DOKUMENTE", "BESICHTIGUNG"]));

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
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
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
    requiredCompleted: items.filter((item) => item.isRequired && item.isCompleted)
      .length,
    requiredTotal: items.filter((item) => item.isRequired).length,
  };

  const progressPercent = (totalProgress.completed / totalProgress.total) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <span>Due Diligence Checkliste</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
                <Save className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              <Button variant="ghost" size="sm" onClick={resetChecklist}>
                <Trash2 className="h-4 w-4 mr-1" />
                Zurücksetzen
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Eine umfassende Checkliste für die Prüfung einer Immobilie vor dem Kauf.
            Arbeiten Sie alle Punkte ab, um Risiken zu minimieren.
          </p>

          {/* Progress Overview */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">Gesamtfortschritt</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {totalProgress.completed} / {totalProgress.total} erledigt (
                {progressPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Pflichtpunkte: {totalProgress.requiredCompleted} /{" "}
                {totalProgress.requiredTotal}
              </span>
              {totalProgress.requiredCompleted < totalProgress.requiredTotal && (
                <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
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
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${categoryColors[category]}`}>
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100">{categoryLabels[category]}</span>
                    <p className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      {progress.completed} / {progress.total} erledigt
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          progress.total > 0
                            ? (progress.completed / progress.total) * 100
                            : 0
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
                      className={`p-3 rounded-lg border transition-all ${
                        item.isCompleted
                          ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800/50"
                          : "bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-700"
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
                                  ? "line-through text-slate-500 dark:text-slate-400"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.isRequired && (
                              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 px-1.5 py-0.5 rounded">
                                Pflicht
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                          {editingNotes === item.id ? (
                            <div className="mt-2">
                              <textarea
                                className="w-full p-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                rows={2}
                                placeholder="Notizen hinzufügen..."
                                value={item.notes || ""}
                                onChange={(e) =>
                                  updateNotes(item.id, e.target.value)
                                }
                                onBlur={() => setEditingNotes(null)}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingNotes(item.id)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {item.notes
                                ? `📝 ${item.notes}`
                                : "📝 Notiz hinzufügen"}
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
        <Card className="bg-gradient-to-r from-green-500 to-green-600">
          <CardContent className="py-6 text-center text-white">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              🎉 Due Diligence abgeschlossen!
            </h3>
            <p className="text-green-100">
              Sie haben alle Prüfpunkte erfolgreich abgearbeitet. Sie sind gut
              vorbereitet für den Immobilienkauf.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
