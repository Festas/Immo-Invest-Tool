"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { calculateRenovationROI } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { RenovationInput, RenovationResult, RenovationTypeLabels } from "@/types";
import {
  Wrench,
  Calculator,
  TrendingUp,
  Hammer,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";

const renovationOptions = Object.entries(RenovationTypeLabels).map(([key, data]) => ({
  value: key,
  label: data.label,
}));

// Help texts for renovation calculator
const helpTexts = {
  renovationType: `Wählen Sie die Art der geplanten Renovierung.

📍 Die Richtwerte werden basierend auf Ihrer Auswahl angepasst.

💡 Kombinierte Maßnahmen können Sie einzeln berechnen und vergleichen.`,

  estimatedCost: `Die geschätzten Gesamtkosten der Renovierung.

📍 Wie ermitteln Sie den Wert?
• Kostenvoranschläge von Handwerkern
• Online-Kostenrechner
• Erfahrungswerte

💡 Planen Sie 10-15% Puffer für Unvorhergesehenes ein.`,

  rentIncrease: `Erwartete monatliche Mieterhöhung nach Renovierung.

📍 Orientierung:
• Mietspiegelvergleich vor/nach
• Vergleich mit ähnlichen renovierten Objekten
• Richtwerte aus der Übersicht

💡 Bei Bestandsmietern: Mieterhöhung max. 20% in 3 Jahren!`,

  valueIncrease: `Erwartete Wertsteigerung der Immobilie.

📍 Faustregeln:
• Bäder/Küchen: 100-150% der Kosten
• Energetische Sanierung: 80-120%
• Böden/Malerarbeiten: 50-80%

💡 Ein Gutachter kann den Wert genau bestimmen.`,

  financingPercent: `Anteil der Renovierung, der finanziert werden soll.

📍 Optionen:
• 0%: Komplett aus Eigenkapital
• 50%: Teilfinanzierung
• 100%: Vollfinanzierung

💡 Finanzierung reduziert die Eigenkapitalbindung, aber erhöht die Kosten.`,

  interestRate: `Zinssatz für die Renovierungsfinanzierung.

📍 Typische Sätze (2024):
• Wohnkredit: 5-8%
• Modernisierungskredit: 4-6%
• Nachfinanzierung: 3-5%

💡 KfW-Förderung prüfen für günstigere Konditionen!`,
};

export function RenovationCalculator() {
  const [input, setInput] = useState<RenovationInput>({
    renovationType: "BAEDER",
    estimatedCost: 15000,
    expectedRentIncrease: 100,
    expectedValueIncrease: 20000,
    financingPercent: 0,
    interestRate: 4.5,
  });

  const [result, setResult] = useState<RenovationResult | null>(null);

  const selectedType = RenovationTypeLabels[input.renovationType];

  const handleCalculate = () => {
    const calculationResult = calculateRenovationROI(input);
    setResult(calculationResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Renovierungs-ROI Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Berechnen Sie die Rentabilität von Renovierungsmaßnahmen und ob sich die Investition
            lohnt.
          </p>

          <Select
            label="Art der Renovierung"
            options={renovationOptions}
            value={input.renovationType}
            onChange={(value) =>
              setInput({
                ...input,
                renovationType: value as RenovationInput["renovationType"],
              })
            }
            helpText={helpTexts.renovationType}
          />

          {selectedType && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm dark:border-blue-900/50 dark:bg-blue-950/50">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                <Lightbulb className="mr-1 inline h-4 w-4" />
                Richtwerte für {selectedType.label}:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-blue-700 dark:text-blue-300">
                <div>
                  <span className="text-xs">Typische Kosten:</span>
                  <p className="font-medium">{selectedType.typicalCost}</p>
                </div>
                <div>
                  <span className="text-xs">Mögliche Mietsteigerung:</span>
                  <p className="font-medium">{selectedType.typicalRentIncrease}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Geschätzte Kosten"
              type="number"
              value={input.estimatedCost}
              onChange={(e) =>
                setInput({
                  ...input,
                  estimatedCost: parseFloat(e.target.value) || 0,
                })
              }
              suffix="€"
              min={0}
              step={1000}
              helpText={helpTexts.estimatedCost}
            />

            <Input
              label="Erwartete Mieterhöhung (monatlich)"
              type="number"
              value={input.expectedRentIncrease}
              onChange={(e) =>
                setInput({
                  ...input,
                  expectedRentIncrease: parseFloat(e.target.value) || 0,
                })
              }
              suffix="€/Monat"
              min={0}
              step={10}
              helpText={helpTexts.rentIncrease}
            />

            <Input
              label="Erwartete Wertsteigerung der Immobilie"
              type="number"
              value={input.expectedValueIncrease}
              onChange={(e) =>
                setInput({
                  ...input,
                  expectedValueIncrease: parseFloat(e.target.value) || 0,
                })
              }
              suffix="€"
              min={0}
              step={1000}
              helpText={helpTexts.valueIncrease}
            />

            <div>
              <Slider
                label="Finanzierungsanteil"
                min={0}
                max={100}
                step={10}
                value={input.financingPercent}
                onChange={(value) => setInput({ ...input, financingPercent: value })}
                formatValue={(v) => `${v}%`}
                helpText={helpTexts.financingPercent}
              />
            </div>
          </div>

          {input.financingPercent > 0 && (
            <Input
              label="Zinssatz für Finanzierung"
              type="number"
              value={input.interestRate}
              onChange={(e) =>
                setInput({
                  ...input,
                  interestRate: parseFloat(e.target.value) || 0,
                })
              }
              suffix="%"
              min={0}
              max={15}
              step={0.1}
              helpText={helpTexts.interestRate}
            />
          )}

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            ROI berechnen
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Analyseergebnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-700/50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-600 dark:text-slate-400">Gesamtkosten</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalCost)}
                </p>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center dark:border-green-900/50 dark:bg-green-950/50">
                <p className="text-xs text-green-600 dark:text-green-400">Mehreinnahmen/Jahr</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  +{formatCurrency(result.annualRentIncrease)}
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 text-center ${
                  result.paybackPeriodYears !== null && result.paybackPeriodYears <= 10
                    ? "border-green-100 bg-green-50 dark:border-green-900/50 dark:bg-green-950/50"
                    : "border-orange-100 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/50"
                }`}
              >
                <p
                  className={`text-xs ${
                    result.paybackPeriodYears !== null && result.paybackPeriodYears <= 10
                      ? "text-green-600 dark:text-green-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  Amortisation
                </p>
                <p className="text-lg font-bold">
                  {result.paybackPeriodYears !== null
                    ? `${result.paybackPeriodYears.toFixed(1)} Jahre`
                    : "Nie"}
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 text-center ${
                  result.roiPercent >= 8
                    ? "border-green-100 bg-green-50 dark:border-green-900/50 dark:bg-green-950/50"
                    : result.roiPercent >= 4
                      ? "border-yellow-100 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/50"
                      : "border-red-100 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50"
                }`}
              >
                <p
                  className={`text-xs ${
                    result.roiPercent >= 8
                      ? "text-green-600 dark:text-green-400"
                      : result.roiPercent >= 4
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Miet-ROI
                </p>
                <p className="text-lg font-bold">{result.roiPercent.toFixed(1)}% p.a.</p>
              </div>
            </div>

            <div className="rounded-lg border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-950/50">
              <p className="mb-2 text-sm font-medium text-purple-900 dark:text-purple-100">
                Wertsteigerungsrendite
              </p>
              <div className="flex items-center justify-between">
                <span className="text-purple-700 dark:text-purple-300">
                  Wertsteigerung / Investition:
                </span>
                <span className="text-lg font-bold">{result.valueIncreaseRoi.toFixed(0)}%</span>
              </div>
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                Eine Wertsteigerungsrendite von über 100% bedeutet, dass die Wertsteigerung die
                Kosten übersteigt.
              </p>
            </div>

            <div
              className={`flex items-start gap-3 rounded-lg border-l-4 p-4 ${
                result.isRecommended
                  ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                  : "border-red-500 bg-red-50 dark:bg-red-950/50"
              }`}
            >
              {result.isRecommended ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              )}
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {result.recommendation}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center gap-2">
                <Hammer className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Zusammenfassung</p>
              </div>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  • Die Investition von <strong>{formatCurrency(result.totalCost)}</strong> in{" "}
                  {selectedType.label} generiert jährlich{" "}
                  <strong>{formatCurrency(result.annualRentIncrease)}</strong> Mehreinnahmen.
                </li>
                <li>
                  • Die Amortisationszeit beträgt{" "}
                  <strong>
                    {result.paybackPeriodYears !== null
                      ? `${result.paybackPeriodYears.toFixed(1)} Jahre`
                      : "mehr als die Nutzungsdauer"}
                  </strong>
                  .
                </li>
                <li>
                  • Die jährliche Mietrendite auf die Investition beträgt{" "}
                  <strong>{result.roiPercent.toFixed(1)}%</strong>.
                </li>
                <li>
                  • Die erwartete Wertsteigerung entspricht{" "}
                  <strong>{result.valueIncreaseRoi.toFixed(0)}%</strong> der Investition.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
