"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { calculateLocationAnalysis } from "@/lib/calculations";
import { LocationAnalysisInput, LocationAnalysisResult, ReferenceRentData } from "@/types";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Train,
  ShoppingBag,
  GraduationCap,
  Shield,
  Home,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
} from "lucide-react";

const cityOptions = Object.entries(ReferenceRentData).map(([key, data]) => ({
  value: key,
  label: data.city,
}));

const populationOptions = [
  { value: "WACHSEND", label: "Wachsend" },
  { value: "STABIL", label: "Stabil" },
  { value: "SCHRUMPFEND", label: "Schrumpfend" },
];

const employmentOptions = [
  { value: "HOCH", label: "Hoch (< 4% Arbeitslosigkeit)" },
  { value: "MITTEL", label: "Mittel (4-7% Arbeitslosigkeit)" },
  { value: "NIEDRIG", label: "Niedrig (> 7% Arbeitslosigkeit)" },
];

const crimeOptions = [
  { value: "NIEDRIG", label: "Niedrig" },
  { value: "MITTEL", label: "Mittel" },
  { value: "HOCH", label: "Hoch" },
];

const demandOptions = [
  { value: "SEHR_HOCH", label: "Sehr hoch (Metropolen)" },
  { value: "HOCH", label: "Hoch (Großstädte)" },
  { value: "MITTEL", label: "Mittel (Mittelstädte)" },
  { value: "NIEDRIG", label: "Niedrig (Ländlich)" },
];

export function LocationAnalysis() {
  const [input, setInput] = useState<LocationAnalysisInput>({
    city: "MUENCHEN",
    district: "",
    populationTrend: "WACHSEND",
    employmentRate: "HOCH",
    infrastructureScore: 7,
    publicTransportScore: 8,
    shoppingScore: 7,
    schoolsScore: 7,
    crimeRate: "NIEDRIG",
    rentalDemand: "SEHR_HOCH",
  });

  const [result, setResult] = useState<LocationAnalysisResult | null>(null);

  const handleCalculate = () => {
    const analysisResult = calculateLocationAnalysis(input);
    setResult(analysisResult);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBadge = (quality: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      D: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[quality] || colors.D;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Standortanalyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bewerten Sie die Attraktivität eines Standorts für Ihre Immobilieninvestition anhand
            verschiedener Faktoren.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Select
              label="Stadt/Region"
              options={cityOptions}
              value={input.city}
              onChange={(value) => setInput({ ...input, city: value })}
            />

            <Select
              label="Bevölkerungsentwicklung"
              options={populationOptions}
              value={input.populationTrend}
              onChange={(value) =>
                setInput({
                  ...input,
                  populationTrend: value as LocationAnalysisInput["populationTrend"],
                })
              }
            />

            <Select
              label="Beschäftigungslage"
              options={employmentOptions}
              value={input.employmentRate}
              onChange={(value) =>
                setInput({
                  ...input,
                  employmentRate: value as LocationAnalysisInput["employmentRate"],
                })
              }
            />

            <Select
              label="Mietnachfrage"
              options={demandOptions}
              value={input.rentalDemand}
              onChange={(value) =>
                setInput({
                  ...input,
                  rentalDemand: value as LocationAnalysisInput["rentalDemand"],
                })
              }
            />

            <Select
              label="Kriminalitätsrate"
              options={crimeOptions}
              value={input.crimeRate}
              onChange={(value) =>
                setInput({
                  ...input,
                  crimeRate: value as LocationAnalysisInput["crimeRate"],
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50">
              <Train className="h-5 w-5 text-blue-500" />
              <Slider
                label="ÖPNV-Anbindung"
                min={1}
                max={10}
                step={1}
                value={input.publicTransportScore}
                onChange={(value) => setInput({ ...input, publicTransportScore: value })}
                formatValue={(v) => `${v}/10`}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
              <Slider
                label="Einkaufsmöglichkeiten"
                min={1}
                max={10}
                step={1}
                value={input.shoppingScore}
                onChange={(value) => setInput({ ...input, shoppingScore: value })}
                formatValue={(v) => `${v}/10`}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <Slider
                label="Schulen & Bildung"
                min={1}
                max={10}
                step={1}
                value={input.schoolsScore}
                onChange={(value) => setInput({ ...input, schoolsScore: value })}
                formatValue={(v) => `${v}/10`}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50">
              <Home className="h-5 w-5 text-green-500" />
              <Slider
                label="Allgemeine Infrastruktur"
                min={1}
                max={10}
                step={1}
                value={input.infrastructureScore}
                onChange={(value) => setInput({ ...input, infrastructureScore: value })}
                formatValue={(v) => `${v}/10`}
              />
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Standort analysieren
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Analyseergebnis</span>
                <span
                  className={`rounded-lg px-4 py-1 text-3xl font-bold ${getQualityBadge(
                    result.locationQuality
                  )}`}
                >
                  {result.locationQuality}-Lage
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Meter */}
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="h-24 w-48" viewBox="0 0 100 50">
                    <path
                      d="M 10 45 A 35 35 0 0 1 90 45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 45 A 35 35 0 0 1 90 45"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.overallScore / 100) * 110} 110`}
                    />
                    <defs>
                      <linearGradient id="scoreGradient">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </span>
                    <span className="ml-1 text-lg text-slate-500 dark:text-slate-400">/100</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Standort-Score</p>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-3 gap-6">
                <div
                  className={`rounded-lg p-4 text-center ${
                    result.investmentRecommendation === "STARK_EMPFOHLEN" ||
                    result.investmentRecommendation === "EMPFOHLEN"
                      ? "bg-green-50 dark:bg-green-950/50"
                      : result.investmentRecommendation === "NEUTRAL"
                        ? "bg-yellow-50 dark:bg-yellow-950/50"
                        : "bg-red-50 dark:bg-red-950/50"
                  }`}
                >
                  <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">
                    Investitionsempfehlung
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {result.investmentRecommendation === "STARK_EMPFOHLEN" && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-green-700 dark:text-green-300">
                          Stark empfohlen
                        </span>
                      </>
                    )}
                    {result.investmentRecommendation === "EMPFOHLEN" && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-green-700 dark:text-green-300">
                          Empfohlen
                        </span>
                      </>
                    )}
                    {result.investmentRecommendation === "NEUTRAL" && (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-300">
                          Neutral
                        </span>
                      </>
                    )}
                    {result.investmentRecommendation === "NICHT_EMPFOHLEN" && (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-bold text-red-700 dark:text-red-300">
                          Nicht empfohlen
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 text-center ${
                    result.riskLevel === "NIEDRIG"
                      ? "bg-green-50 dark:bg-green-950/50"
                      : result.riskLevel === "MITTEL"
                        ? "bg-yellow-50 dark:bg-yellow-950/50"
                        : "bg-red-50 dark:bg-red-950/50"
                  }`}
                >
                  <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">Risikostufe</p>
                  <div className="flex items-center justify-center gap-1">
                    <Shield
                      className={`h-5 w-5 ${
                        result.riskLevel === "NIEDRIG"
                          ? "text-green-600"
                          : result.riskLevel === "MITTEL"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        result.riskLevel === "NIEDRIG"
                          ? "text-green-700 dark:text-green-300"
                          : result.riskLevel === "MITTEL"
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {result.riskLevel === "NIEDRIG"
                        ? "Niedrig"
                        : result.riskLevel === "MITTEL"
                          ? "Mittel"
                          : "Hoch"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/50">
                  <p className="mb-1 text-xs text-slate-600 dark:text-slate-400">Lagequalität</p>
                  <span
                    className={`text-xl font-bold ${
                      result.locationQuality === "A"
                        ? "text-green-600"
                        : result.locationQuality === "B"
                          ? "text-blue-600"
                          : result.locationQuality === "C"
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                  >
                    {result.locationQuality}-Lage
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5" />
                  Stärken
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200"
                      >
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Keine besonderen Stärken identifiziert.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-300">
                  <TrendingDown className="h-5 w-5" />
                  Schwächen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {result.weaknesses.map((weakness, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200"
                      >
                        <XCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Keine wesentlichen Schwächen identifiziert.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Explanation */}
          <Card>
            <CardContent className="py-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                <h4 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
                  Erläuterung der Lagequalität
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div>
                    <span className="font-bold text-green-600 dark:text-green-400">A-Lage:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Beste Lagen, hohe Nachfrage, stabile Wertentwicklung
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">B-Lage:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Gute Lagen, solide Nachfrage, Aufwertungspotenzial
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">C-Lage:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Durchschnitt, moderate Nachfrage, höheres Risiko
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-red-600 dark:text-red-400">D-Lage:</span>
                    <p className="text-slate-600 dark:text-slate-400">
                      Schwierige Lagen, geringe Nachfrage, hohes Risiko
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
