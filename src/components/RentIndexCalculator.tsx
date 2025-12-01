"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { calculateRentIndex } from "@/lib/calculations";
import { RentIndexInput, RentIndexResult, ReferenceRentData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MapPin, TrendingUp, Calculator, Home } from "lucide-react";

const cityOptions = Object.entries(ReferenceRentData).map(([key, data]) => ({
  value: key,
  label: data.city,
}));

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
  city: `Wählen Sie die Stadt/Region für den Mietspiegelvergleich.

📍 Größere Städte haben höhere Durchschnittsmieten.

💡 Falls Ihre Stadt nicht gelistet ist, wählen Sie eine vergleichbare Stadt oder "Sonstige / Ländlich".`,

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

  const handleCalculate = () => {
    const calculationResult = calculateRentIndex(input);
    setResult(calculationResult);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Mietpreisspiegel - Marktmieten-Vergleich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vergleichen Sie Ihre aktuelle Miete mit dem lokalen Mietpreisspiegel und
            ermitteln Sie Ihr Mieterhöhungspotenzial.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Stadt/Region"
              options={cityOptions}
              value={input.city}
              onChange={(value) => setInput({ ...input, city: value })}
              helpText={helpTexts.city}
            />

            <Input
              label="Wohnfläche (m²)"
              type="number"
              value={input.livingArea}
              onChange={(e) =>
                setInput({ ...input, livingArea: parseFloat(e.target.value) || 0 })
              }
              suffix="m²"
              min={10}
              max={500}
              helpText={helpTexts.livingArea}
            />

            <Input
              label="Aktuelle Kaltmiete (monatlich)"
              type="number"
              value={input.currentRent}
              onChange={(e) =>
                setInput({ ...input, currentRent: parseFloat(e.target.value) || 0 })
              }
              suffix="€"
              min={0}
              helpText={helpTexts.currentRent}
            />

            <Input
              label="Baujahr"
              type="number"
              value={input.yearBuilt}
              onChange={(e) =>
                setInput({ ...input, yearBuilt: parseInt(e.target.value) || 1970 })
              }
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
              onChange={(e) =>
                setInput({ ...input, floor: parseInt(e.target.value) || 0 })
              }
              min={0}
              max={30}
              helpText={helpTexts.floor}
            />

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.hasBalcony}
                  onChange={(e) =>
                    setInput({ ...input, hasBalcony: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Balkon/Terrasse vorhanden
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.hasElevator}
                  onChange={(e) =>
                    setInput({ ...input, hasElevator: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                Aufzug vorhanden
              </label>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Ihre Miete/m²
                </p>
                <p className="text-lg font-bold">
                  {result.currentRentPerSqm.toFixed(2)} €
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Marktmiete/m²
                </p>
                <p className="text-lg font-bold">
                  {result.marketRentPerSqm.toFixed(2)} €
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Marktmiete (Monat)
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(result.adjustedMarketRent)}
                </p>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${
                  result.rentPotential > 0
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-red-50 dark:bg-red-950"
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

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Marktspanne für diese Region:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {result.marketRentRange.min.toFixed(2)} €/m²
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{
                      width: `${
                        ((result.marketRentPerSqm - result.marketRentRange.min) /
                          (result.marketRentRange.max - result.marketRentRange.min)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {result.marketRentRange.max.toFixed(2)} €/m²
                </span>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border-l-4 ${
                result.rentPotential > 10
                  ? "bg-green-50 border-green-500"
                  : result.rentPotential > 0
                  ? "bg-yellow-50 border-yellow-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <p className="font-medium">{result.recommendation}</p>
            </div>

            {result.rentPotential > 5 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Mögliche Mieterhöhung
                  </p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Bei einer Anpassung an die Marktmiete könnten Sie monatlich{" "}
                  <strong>
                    {formatCurrency(result.adjustedMarketRent - input.currentRent)}
                  </strong>{" "}
                  mehr erhalten. Das entspricht{" "}
                  <strong>
                    {formatCurrency(
                      (result.adjustedMarketRent - input.currentRent) * 12
                    )}
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
