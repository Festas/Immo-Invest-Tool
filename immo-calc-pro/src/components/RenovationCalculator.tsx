"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { calculateRenovationROI } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import {
  RenovationInput,
  RenovationResult,
  RenovationTypeLabels,
} from "@/types";
import {
  Wrench,
  Calculator,
  TrendingUp,
  Hammer,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";

const renovationOptions = Object.entries(RenovationTypeLabels).map(
  ([key, data]) => ({
    value: key,
    label: data.label,
  })
);

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Renovierungs-ROI Rechner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Berechnen Sie die Rentabilität von Renovierungsmaßnahmen und ob sich
            die Investition lohnt.
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
          />

          {selectedType && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                <Lightbulb className="inline h-4 w-4 mr-1" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            />

            <div>
              <Slider
                label="Finanzierungsanteil"
                min={0}
                max={100}
                step={10}
                value={input.financingPercent}
                onChange={(value) =>
                  setInput({ ...input, financingPercent: value })
                }
                formatValue={(v) => `${v}%`}
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
            />
          )}

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gesamtkosten
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(result.totalCost)}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Mehreinnahmen/Jahr
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  +{formatCurrency(result.annualRentIncrease)}
                </p>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${
                  result.paybackPeriodYears <= 10
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-orange-50 dark:bg-orange-950"
                }`}
              >
                <p
                  className={`text-xs ${
                    result.paybackPeriodYears <= 10
                      ? "text-green-600 dark:text-green-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  Amortisation
                </p>
                <p className="text-lg font-bold">
                  {result.paybackPeriodYears < 100
                    ? `${result.paybackPeriodYears.toFixed(1)} Jahre`
                    : "Nie"}
                </p>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${
                  result.roiPercent >= 8
                    ? "bg-green-50 dark:bg-green-950"
                    : result.roiPercent >= 4
                    ? "bg-yellow-50 dark:bg-yellow-950"
                    : "bg-red-50 dark:bg-red-950"
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
                <p className="text-lg font-bold">
                  {result.roiPercent.toFixed(1)}% p.a.
                </p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                Wertsteigerungsrendite
              </p>
              <div className="flex items-center justify-between">
                <span className="text-purple-700 dark:text-purple-300">
                  Wertsteigerung / Investition:
                </span>
                <span className="font-bold text-lg">
                  {result.valueIncreaseRoi.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Eine Wertsteigerungsrendite von über 100% bedeutet, dass die
                Wertsteigerung die Kosten übersteigt.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                result.isRecommended
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              {result.isRecommended ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{result.recommendation}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Hammer className="h-5 w-5 text-gray-600" />
                <p className="font-medium">Zusammenfassung</p>
              </div>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>
                  • Die Investition von{" "}
                  <strong>{formatCurrency(result.totalCost)}</strong> in{" "}
                  {selectedType.label} generiert jährlich{" "}
                  <strong>{formatCurrency(result.annualRentIncrease)}</strong>{" "}
                  Mehreinnahmen.
                </li>
                <li>
                  • Die Amortisationszeit beträgt{" "}
                  <strong>
                    {result.paybackPeriodYears < 100
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
                  <strong>{result.valueIncreaseRoi.toFixed(0)}%</strong> der
                  Investition.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
