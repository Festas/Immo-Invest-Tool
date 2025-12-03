"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { useImmoCalcStore } from "@/store";
import { BundeslandData, Bundesland, AfARates, AfAType } from "@/types";
import { Building2, Banknote, Home, Receipt } from "lucide-react";

const bundeslandOptions = Object.entries(BundeslandData).map(([key, data]) => ({
  value: key,
  label: `${data.name} (${data.taxRate}%)`,
}));

const afaOptions = Object.entries(AfARates).map(([key, data]) => ({
  value: key,
  label: data.label,
}));

// Help texts for all input fields
const helpTexts = {
  purchasePrice: `Der Kaufpreis der Immobilie (ohne Nebenkosten).

📍 Wo finden Sie den Wert?
• Im Exposé des Maklers
• Auf Immobilienportalen (ImmoScout24, Immowelt)
• Im notariellen Kaufvertrag

💡 Tipp: Vergleichen Sie mit ähnlichen Objekten in der Umgebung.`,

  bundesland: `Das Bundesland bestimmt die Grunderwerbsteuer.

📍 Aktuelle Sätze (2024):
• Bayern: 3,5% (niedrigster Satz)
• NRW, Brandenburg: 6,5% (höchster Satz)
• Die meisten Länder: 5-6%

Die Steuer wird automatisch berechnet.`,

  broker: `Maklerprovision in Prozent des Kaufpreises.

📍 Typische Werte:
• Mit Makler: 2-3,57% (je Partei)
• Provisionsfrei: 0%

💡 Seit 2020 gilt meist die Käufer-Verkäufer-Teilung.
Fragen Sie beim Makler nach dem genauen Satz.`,

  notary: `Notar- und Grundbuchkosten in Prozent.

📍 Typische Werte:
• Notar: ca. 1-1,5%
• Grundbuch: ca. 0,5%
• Gesamt: ca. 1,5-2%

Diese Kosten sind gesetzlich geregelt.`,

  renovation: `Geplante Renovierungskosten nach Kauf.

📍 Beispiele:
• Kleine Renovierung: 5.000-15.000 €
• Neue Küche/Bad: 15.000-40.000 €
• Kernsanierung: 50.000-150.000 €

💡 Holen Sie Kostenvoranschläge ein!`,

  equity: `Eigenkapital = Ihr eingesetztes Kapital.

📍 Empfohlen:
• Mindestens 20-30% der Gesamtkosten
• Kaufnebenkosten sollten aus EK bezahlt werden

💡 Berechnung: EK = Ersparnisse + evtl. Eigenleistung

Je mehr EK, desto bessere Konditionen.`,

  interestRate: `Jährlicher Sollzinssatz des Darlehens.

📍 Wo finden Sie den Wert?
• In Finanzierungsangeboten der Bank
• Bei Vergleichsportalen (Interhyp, Dr. Klein)

💡 Stand 2024: ca. 3-4% (10 Jahre Zinsbindung)
Fragen Sie mehrere Banken an!`,

  repayment: `Anfängliche Tilgung in Prozent pro Jahr.

📍 Empfohlen:
• Minimum: 1% (aber langsame Entschuldung)
• Besser: 2-3% für schnellere Tilgung
• Schnell: 4-5% oder Sondertilgungen

💡 Höhere Tilgung = weniger Gesamtzinsen.`,

  fixedInterest: `Zinsbindungsdauer in Jahren.

📍 Typische Optionen:
• 5 Jahre: günstiger, aber riskant
• 10 Jahre: Standard-Empfehlung
• 15-20 Jahre: mehr Sicherheit
• 30 Jahre: maximale Planbarkeit

💡 Längere Bindung = höherer Zins, aber mehr Sicherheit.`,

  coldRent: `Monatliche Nettokaltmiete (ohne Nebenkosten).

📍 Wo finden Sie den Wert?
• Im aktuellen Mietvertrag
• Bei Neuvermietung: lokaler Mietspiegel
• Vergleich auf Immobilienportalen

💡 Bei vermieteten Objekten: aktuelle Miete verwenden.`,

  nonRecoverable: `Nicht auf Mieter umlegbare Kosten pro Monat.

📍 Beispiele:
• Hausverwaltung: 20-30 €/Monat
• Bankgebühren: 5-10 €/Monat
• Leerstandskosten anteilig

💡 Ca. 50-150 €/Monat einplanen.`,

  maintenance: `Monatliche Instandhaltungsrücklage.

📍 Faustformel:
• Neubau: 0,50-1,00 €/m²/Monat
• Altbau: 1,00-2,00 €/m²/Monat

💡 Bei WEG: Hausgeld enthält bereits Rücklage.
Trotzdem eigene Reserve einplanen!`,

  vacancy: `Erwarteter Mietausfall in Prozent.

📍 Richtwerte:
• Sehr gute Lage: 1-2%
• Normale Lage: 2-3%
• Schwächere Lage: 4-5%

💡 Berücksichtigt: Leerstand, Mietausfälle, Mietminderungen.`,

  afaType: `Abschreibungsart nach deutschem Steuerrecht.

📍 Sätze nach Baujahr:
• Vor 1925: 2,5% linear
• Ab 1925: 2% linear
• Neubau ab 2023: 3% (unter Bedingungen)
• Denkmalschutz: bis zu 9%

💡 Info: Baujahr im Grundbuch/Energieausweis.`,

  buildingShare: `Gebäudeanteil am Gesamtkaufpreis.

📍 Typische Werte:
• ETW in Stadt: 70-85%
• EFH mit großem Grundstück: 60-75%
• Nur das Gebäude ist abschreibbar!

💡 Ermittlung: Gutachter oder Kaufvertrag-Aufteilung.`,

  taxRate: `Ihr persönlicher Grenzsteuersatz.

📍 Richtwerte (2024):
• 20.000 € Einkommen: ca. 25%
• 40.000 € Einkommen: ca. 30%
• 60.000 € Einkommen: ca. 35-38%
• 80.000+ € Einkommen: ca. 42-45%

💡 Finden Sie im Steuerbescheid oder fragen Sie Ihren Steuerberater.`,
};

export function PropertyCalculatorForm() {
  const { currentInput, updateInput } = useImmoCalcStore();

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateInput({ purchasePrice: value });
  };

  const handleBundeslandChange = (value: string) => {
    const bundesland = value as Bundesland;
    const taxRate = BundeslandData[bundesland].taxRate;
    updateInput({ propertyTransferTaxPercent: taxRate });
  };

  // Memoize the bundesland lookup to avoid recalculating on every render
  const selectedBundesland = React.useMemo(() => {
    return Object.keys(BundeslandData).find(
      (key) => BundeslandData[key as Bundesland].taxRate === currentInput.propertyTransferTaxPercent
    ) || "BAYERN";
  }, [currentInput.propertyTransferTaxPercent]);

  return (
    <div className="space-y-5">
      {/* Purchase & Costs Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/50 dark:to-purple-900/50">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent font-bold">
              Kaufpreis & Nebenkosten
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <Input
            label="Kaufpreis"
            type="number"
            value={currentInput.purchasePrice}
            onChange={handlePurchasePriceChange}
            suffix="€"
            min={0}
            step={1000}
            helpText={helpTexts.purchasePrice}
          />

          <Select
            label="Bundesland"
            options={bundeslandOptions}
            value={selectedBundesland}
            onChange={handleBundeslandChange}
            helpText={helpTexts.bundesland}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Makler"
              type="number"
              value={currentInput.brokerPercent}
              onChange={(e) => updateInput({ brokerPercent: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0}
              max={10}
              step={0.01}
              helpText={helpTexts.broker}
            />
            <Input
              label="Notar & Grundbuch"
              type="number"
              value={currentInput.notaryPercent}
              onChange={(e) => updateInput({ notaryPercent: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0}
              max={5}
              step={0.1}
              helpText={helpTexts.notary}
            />
          </div>

          <Input
            label="Renovierungskosten"
            type="number"
            value={currentInput.renovationCosts}
            onChange={(e) => updateInput({ renovationCosts: parseFloat(e.target.value) || 0 })}
            suffix="€"
            min={0}
            step={1000}
            helpText={helpTexts.renovation}
          />
        </CardContent>
      </Card>

      {/* Financing Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/50 dark:to-teal-900/50">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Banknote className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent font-bold">
              Finanzierung
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <Slider
            label="Eigenkapital"
            min={0}
            max={currentInput.purchasePrice}
            step={1000}
            value={currentInput.equity}
            onChange={(value) => updateInput({ equity: value })}
            formatValue={(v) => `€${v.toLocaleString("de-DE")}`}
            helpText={helpTexts.equity}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Zinssatz"
              type="number"
              value={currentInput.interestRate}
              onChange={(e) => updateInput({ interestRate: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0}
              max={15}
              step={0.1}
              helpText={helpTexts.interestRate}
            />
            <Input
              label="Tilgung"
              type="number"
              value={currentInput.repaymentRate}
              onChange={(e) => updateInput({ repaymentRate: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0.5}
              max={10}
              step={0.1}
              helpText={helpTexts.repayment}
            />
          </div>

          <Slider
            label="Zinsbindung"
            min={5}
            max={30}
            step={1}
            value={currentInput.fixedInterestPeriod}
            onChange={(value) => updateInput({ fixedInterestPeriod: value })}
            formatValue={(v) => `${v} Jahre`}
            helpText={helpTexts.fixedInterest}
          />
        </CardContent>
      </Card>

      {/* Rental Income Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/50 dark:to-orange-900/50">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent font-bold">
              Mieteinnahmen
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <Input
            label="Kaltmiete (IST) monatlich"
            type="number"
            value={currentInput.coldRentActual}
            onChange={(e) => updateInput({ coldRentActual: parseFloat(e.target.value) || 0 })}
            suffix="€"
            min={0}
            step={50}
            helpText={helpTexts.coldRent}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nicht umlegbare NK"
              type="number"
              value={currentInput.nonRecoverableCosts}
              onChange={(e) => updateInput({ nonRecoverableCosts: parseFloat(e.target.value) || 0 })}
              suffix="€"
              min={0}
              step={10}
              helpText={helpTexts.nonRecoverable}
            />
            <Input
              label="Instandhaltung"
              type="number"
              value={currentInput.maintenanceReserve}
              onChange={(e) => updateInput({ maintenanceReserve: parseFloat(e.target.value) || 0 })}
              suffix="€"
              min={0}
              step={10}
              helpText={helpTexts.maintenance}
            />
          </div>

          <Slider
            label="Mietausfallwagnis"
            min={0}
            max={10}
            step={0.5}
            value={currentInput.vacancyRiskPercent}
            onChange={(value) => updateInput({ vacancyRiskPercent: value })}
            formatValue={(v) => `${v}%`}
            helpText={helpTexts.vacancy}
          />
        </CardContent>
      </Card>

      {/* Tax Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50 dark:from-violet-900/50 dark:to-fuchsia-900/50">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Receipt className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-700 to-fuchsia-700 dark:from-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent font-bold">
              Steuerliche Parameter
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <Select
            label="AfA-Typ"
            options={afaOptions}
            value={currentInput.afaType}
            onChange={(value) => updateInput({ afaType: value as AfAType })}
            helpText={helpTexts.afaType}
          />

          <Slider
            label="Gebäudeanteil"
            min={50}
            max={95}
            step={1}
            value={currentInput.buildingSharePercent}
            onChange={(value) => updateInput({ buildingSharePercent: value })}
            formatValue={(v) => `${v}%`}
            helpText={helpTexts.buildingShare}
          />

          <Slider
            label="Persönlicher Grenzsteuersatz"
            min={0}
            max={45}
            step={1}
            value={currentInput.personalTaxRate}
            onChange={(value) => updateInput({ personalTaxRate: value })}
            formatValue={(v) => `${v}%`}
            helpText={helpTexts.taxRate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
