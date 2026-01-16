"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/ui/location-search";
import { calculateRentIndex } from "@/lib/calculations";
import { RentIndexInput, RentIndexResult, CityRentData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { PLZResult } from "@/lib/api/openplz";
import { MapPin, TrendingUp, Calculator, Home, Info } from "lucide-react";
import rentIndexData from "@/data/rent-index-extended.json";

const conditionOptions = [
  { value: "SEHR_GUT", label: "Sehr gut (neuwertig/luxussaniert)" },
  { value: "GUT", label: "Gut (gepflegt)" },
  { value: "MITTEL", label: "Mittel (normale Abnutzung)" },
  { value: "RENOVIERUNGSBEDUERFTIG", label: "Renovierungsbedürftig" },
];

const equipmentOptions = [
  { value: "GEHOBEN", label: "Gehoben (Parkett, Fußbodenheizung, etc.)" },
  { value: "STANDARD", label: "Standard" },
  { value: "EINFACH", label: "Einfach (Basisausstattung)" },
];

// Help texts for rent index calculator
const helpTexts = {
  city: `Suchen Sie nach PLZ oder Ortsname für den Mietspiegelvergleich.

📍 Über 70 deutsche Städte in der Datenbank.

💡 Falls Ihre Stadt nicht gefunden wird, wird "Sonstige / Ländlich" als Vergleich verwendet.`,

  livingArea: `Die Wohnfläche der Immobilie in Quadratmetern.

📍 Wo finden Sie den Wert?
• Im Mietvertrag
• Im Grundriss/Exposé
• Im Grundbuch

💡 Nur die Wohnfläche zählt, nicht Keller oder Terrasse.`,

  currentRent: `Die aktuelle monatliche Nettokaltmiete (ohne Nebenkosten).

📍 Wo finden Sie den Wert?
• Im Mietvertrag unter "Grundmiete"
• In der monatlichen Mietabrechnung

💡 Bei Neuvermietung: erwartete Miete eingeben.`,

  yearBuilt: `Das Baujahr der Immobilie.

📍 Wo finden Sie den Wert?
• Im Energieausweis
• Im Grundbuchauszug
• Im Exposé

💡 Ältere Gebäude haben oft niedrigere Mietansätze.`,

  condition: `Der aktuelle Zustand der Immobilie.

📍 Bewertungskriterien:
• Sehr gut: Neuwertig oder kürzlich saniert
• Gut: Gepflegt, keine größeren Mängel
• Mittel: Normale Abnutzung, kleinere Mängel
• Renovierungsbedürftig: Größerer Sanierungsbedarf`,

  equipment: `Die Ausstattungsqualität der Immobilie.

📍 Kriterien:
• Gehoben: Parkett, Fußbodenheizung, hochwertige Küche
• Standard: Normaler Bodenbelag, einfache Küche
• Einfach: Basisausstattung, ältere Technik`,

  floor: `Die Etage, in der sich die Wohnung befindet.

📍 Einfluss auf die Miete:
• EG (0): Oft etwas günstiger
• 1.-3. OG: Standardpreise
• Ab 4. OG: Aufzug wichtig für Preis

💡 Bei Aufzug ist die Etage weniger relevant.`,
};

export function RentIndexCalculator() {
  const [input, setInput] = useState<RentIndexInput>({
    city: "MUENCHEN",
    livingArea: 75,
    currentRent: 1000,
    yearBuilt: 1970,
    condition: "GUT",
    equipment: "STANDARD",
    hasBalcony: true,
    hasElevator: false,
    floor: 2,
  });

  const [result, setResult] = useState<RentIndexResult | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PLZResult | null>(null);
  const [dataSource, setDataSource] = useState<string>("München");

  const findCityInDatabase = (cityName: string): string => {
    // Try to find exact match first
    const exactMatch = Object.keys(rentIndexData).find(
      (key) =>
        (rentIndexData as Record<string, CityRentData>)[key].city.toLowerCase() ===
        cityName.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Try partial match
    const partialMatch = Object.keys(rentIndexData).find((key) =>
      (rentIndexData as Record<string, CityRentData>)[key].city
        .toLowerCase()
        .includes(cityName.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Default to SONSTIGE
    return "SONSTIGE";
  };

  const handleLocationSelect = (location: PLZResult) => {
    setSelectedLocation(location);
    const cityKey = findCityInDatabase(location.name);
    const cityData = (rentIndexData as Record<string, CityRentData>)[cityKey];
    setInput({ ...input, city: cityKey });
    setDataSource(cityData.city);
  };

  const handleCalculate = () => {
    const calculationResult = calculateRentIndex(input);
    setResult(calculationResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Mietpreisspiegel - Marktmieten-Vergleich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Suchen Sie nach PLZ oder Ort, um Ihre Miete mit dem lokalen Mietpreisspiegel zu
            vergleichen und Ihr Mieterhöhungspotenzial zu ermitteln.
          </p>

          {/* Location Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              PLZ / Ort suchen
            </label>
            <LocationSearch onSelect={handleLocationSelect} />
            {selectedLocation && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-50 p-2 dark:bg-indigo-900/20">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Vergleichsdaten: <strong>{dataSource}</strong>
                  {dataSource === "Sonstige / Ländlich" && " (Stadt nicht in Datenbank gefunden)"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Wohnfläche (m²)"
              type="number"
              value={input.livingArea}
              onChange={(e) => setInput({ ...input, livingArea: parseFloat(e.target.value) || 0 })}
              suffix="m²"
              min={10}
              max={500}
              helpText={helpTexts.livingArea}
            />

            <Input
              label="Aktuelle Kaltmiete (monatlich)"
              type="number"
              value={input.currentRent}
              onChange={(e) => setInput({ ...input, currentRent: parseFloat(e.target.value) || 0 })}
              suffix="€"
              min={0}
              helpText={helpTexts.currentRent}
            />

            <Input
              label="Baujahr"
              type="number"
              value={input.yearBuilt}
              onChange={(e) => setInput({ ...input, yearBuilt: parseInt(e.target.value) || 1970 })}
              min={1800}
              max={new Date().getFullYear()}
              helpText={helpTexts.yearBuilt}
            />

            <Select
              label="Zustand"
              options={conditionOptions}
              value={input.condition}
              onChange={(value) =>
                setInput({
                  ...input,
                  condition: value as RentIndexInput["condition"],
                })
              }
              helpText={helpTexts.condition}
            />

            <Select
              label="Ausstattung"
              options={equipmentOptions}
              value={input.equipment}
              onChange={(value) =>
                setInput({
                  ...input,
                  equipment: value as RentIndexInput["equipment"],
                })
              }
              helpText={helpTexts.equipment}
            />

            <Input
              label="Etage"
              type="number"
              value={input.floor}
              onChange={(e) => setInput({ ...input, floor: parseInt(e.target.value) || 0 })}
              min={0}
              max={30}
              helpText={helpTexts.floor}
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={input.hasBalcony}
                  onChange={(e) => setInput({ ...input, hasBalcony: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Balkon/Terrasse vorhanden
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={input.hasElevator}
                  onChange={(e) => setInput({ ...input, hasElevator: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Aufzug vorhanden
              </label>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Mietpotenzial berechnen
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
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/50">
                <p className="text-xs text-blue-600 dark:text-blue-400">Ihre Miete/m²</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {result.currentRentPerSqm.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center dark:border-green-900/50 dark:bg-green-950/50">
                <p className="text-xs text-green-600 dark:text-green-400">Marktmiete/m²</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {result.marketRentPerSqm.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-center dark:border-purple-900/50 dark:bg-purple-950/50">
                <p className="text-xs text-purple-600 dark:text-purple-400">Marktmiete (Monat)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.adjustedMarketRent)}
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 text-center ${
                  result.rentPotential > 0
                    ? "border-green-100 bg-green-50 dark:border-green-900/50 dark:bg-green-950/50"
                    : "border-red-100 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50"
                }`}
              >
                <p
                  className={`text-xs ${
                    result.rentPotential > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Mietpotenzial
                </p>
                <p className="text-lg font-bold">
                  {result.rentPotential > 0 ? "+" : ""}
                  {result.rentPotential.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                Marktspanne für diese Region:
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {result.marketRentRange.min.toFixed(2)} €/m²
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${
                        ((result.marketRentPerSqm - result.marketRentRange.min) /
                          (result.marketRentRange.max - result.marketRentRange.min)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {result.marketRentRange.max.toFixed(2)} €/m²
                </span>
              </div>
            </div>

            <div
              className={`rounded-lg border-l-4 p-4 ${
                result.rentPotential > 10
                  ? "border-green-500 bg-green-50 dark:bg-green-950/50"
                  : result.rentPotential > 0
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"
                    : "border-red-500 bg-red-50 dark:bg-red-950/50"
              }`}
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {result.recommendation}
              </p>
            </div>

            {result.rentPotential > 5 && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Mögliche Mieterhöhung
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Bei einer Anpassung an die Marktmiete könnten Sie monatlich{" "}
                  <strong>{formatCurrency(result.adjustedMarketRent - input.currentRent)}</strong>{" "}
                  mehr erhalten. Das entspricht{" "}
                  <strong>
                    {formatCurrency((result.adjustedMarketRent - input.currentRent) * 12)}
                  </strong>{" "}
                  pro Jahr.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
