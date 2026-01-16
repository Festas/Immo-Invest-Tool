"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useImmoCalcStore } from "@/store";
import { BundeslandData, Bundesland, AfARates, AfAType } from "@/types";
import { formatCurrency, calculateMarketValueDiscount } from "@/lib/utils";
import {
  Building2,
  Banknote,
  Home,
  Receipt,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Info,
} from "lucide-react";

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

  familyPurchase: `Familienkauf - Steuerbefreiung nach § 3 Nr. 6 GrEStG

📍 Befreit sind Käufe zwischen:
• Eltern ↔ Kinder
• Großeltern ↔ Enkel
• Ehepartner / eingetragene Lebenspartner

❌ NICHT befreit:
• Geschwister
• Onkel/Tanten ↔ Neffen/Nichten
• Schwiegereltern

💡 Bei Familienkäufen entfällt meist auch der Makler, da privat verkauft wird.`,

  marketValue: `Der geschätzte Marktwert der Immobilie.

📍 Wofür ist das nützlich?
• Zeigt Ihre Ersparnis bei Käufen unter Marktwert
• Hilft bei der Einschätzung des Deals

💡 Ermittlung des Marktwerts:
• Vergleichbare Angebote auf ImmoScout24
• Gutachter / Sachverständiger
• Bodenrichtwert + Gebäudewert

Hinweis: Alle Berechnungen basieren auf dem tatsächlichen Kaufpreis.`,

  appreciation: `Erwartete jährliche Wertsteigerung der Immobilie.

📍 Richtwerte:
• Großstädte (München, Hamburg): 2-4%
• Mittelstädte: 1-2%
• Ländliche Gebiete: 0-1%
• Schrumpfende Regionen: -1 bis 0%

💡 Historisch: Durchschnitt in Deutschland ca. 2-3% p.a.`,

  rentIncrease: `Erwartete jährliche Mietsteigerung.

📍 Richtwerte:
• Nachgefragte Lagen: 1,5-3%
• Normale Lagen: 1-1,5%
• Schwächere Lagen: 0-1%

💡 Mieterhöhungen sind gesetzlich begrenzt (Kappungsgrenze).
Orientierung: Inflationsrate + lokale Nachfrage.`,

  movableAssets: `Bewegliche Güter - Separate Abschreibung

📍 Typische Beispiele:
• Einbauküche (häufigster Fall)
• Markisen, Jalousien
• Einbaumöbel
• Sauna, Whirlpool

💡 Voraussetzungen:
• Separat erworben oder im Kaufvertrag ausgewiesen
• Nicht fest mit Gebäude verbunden
• Nachweis durch separate Rechnung empfohlen

📊 Steuerlicher Vorteil:
Kürzere Abschreibung (10 Jahre) statt Gebäude-AfA (40-50 Jahre)
→ Höhere jährliche Steuerersparnis

Beispiel: 5.000€ Küche = 500€/Jahr zusätzliche AfA`,

  movableAssetsYears: `Abschreibungsdauer für bewegliche Güter.

📍 Typische Nutzungsdauern (AfA-Tabelle):
• Einbauküche: 10 Jahre
• Markisen: 10-12 Jahre  
• Möbel: 10-13 Jahre

💡 Bei gebrauchten Gütern kann die Restnutzungsdauer angesetzt werden.

Standard: 10 Jahre (empfohlen für Einbauküchen)`,
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
    updateInput({
      bundesland: bundesland,
      propertyTransferTaxPercent: taxRate,
    });
  };

  // Simply use the stored bundesland value
  const selectedBundesland = currentInput.bundesland || "BAYERN";

  // Memoize market value discount calculation
  const marketValueDiscount = React.useMemo(() => {
    return calculateMarketValueDiscount(currentInput.purchasePrice, currentInput.marketValue);
  }, [currentInput.purchasePrice, currentInput.marketValue]);

  return (
    <Accordion type="single" defaultValue="purchase" className="space-y-4">
      {/* Purchase & Costs Section */}
      <AccordionItem value="purchase">
        <Card className="overflow-hidden">
          <AccordionTrigger>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span>Kaufpreis & Nebenkosten</span>
          </AccordionTrigger>
          <AccordionContent>
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

              <Input
                label="Marktwert (optional)"
                type="number"
                value={currentInput.marketValue ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    updateInput({ marketValue: undefined });
                  } else {
                    const parsed = parseFloat(value);
                    updateInput({ marketValue: isNaN(parsed) ? undefined : parsed });
                  }
                }}
                suffix="€"
                min={0}
                step={1000}
                placeholder="Geschätzter Marktwert..."
                helpText={helpTexts.marketValue}
              />

              {/* Show discount if market value is entered and higher than purchase price */}
              {marketValueDiscount && (
                <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                  <TrendingDown className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Sie kaufen {marketValueDiscount.discountPercent.toFixed(1)}% unter Marktwert
                    (Ersparnis: {formatCurrency(marketValueDiscount.discountAmount)})
                  </span>
                </div>
              )}

              <Select
                label="Bundesland"
                options={bundeslandOptions}
                value={selectedBundesland}
                onChange={handleBundeslandChange}
                helpText={helpTexts.bundesland}
              />

              {/* Family Purchase Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex-1">
                  <label className="font-medium text-slate-900 dark:text-white">
                    Familienkauf (direkte Linie)
                  </label>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Käufe von Eltern, Großeltern, Kindern sind von der Grunderwerbsteuer befreit
                  </p>
                </div>
                <Switch
                  checked={currentInput.isFamilyPurchase}
                  onChange={(checked) => updateInput({ isFamilyPurchase: checked })}
                  aria-label="Familienkauf aktivieren"
                />
              </div>

              {/* Family Purchase Info Banner */}
              {currentInput.isFamilyPurchase && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Grunderwerbsteuer: 0% (Familienbefreiung) · Makler: 0%</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Financing Section */}
      <AccordionItem value="financing">
        <Card className="overflow-hidden">
          <AccordionTrigger>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
              <Banknote className="h-4 w-4 text-white" />
            </div>
            <span>Finanzierung</span>
          </AccordionTrigger>
          <AccordionContent>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
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
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Rental Income Section */}
      <AccordionItem value="rental">
        <Card className="overflow-hidden">
          <AccordionTrigger>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span>Mieteinnahmen</span>
          </AccordionTrigger>
          <AccordionContent>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <Input
                  label="Nicht umlegbare NK"
                  type="number"
                  value={currentInput.nonRecoverableCosts}
                  onChange={(e) =>
                    updateInput({ nonRecoverableCosts: parseFloat(e.target.value) || 0 })
                  }
                  suffix="€"
                  min={0}
                  step={10}
                  helpText={helpTexts.nonRecoverable}
                />
                <Input
                  label="Instandhaltung"
                  type="number"
                  value={currentInput.maintenanceReserve}
                  onChange={(e) =>
                    updateInput({ maintenanceReserve: parseFloat(e.target.value) || 0 })
                  }
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
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Tax Section */}
      <AccordionItem value="tax">
        <Card className="overflow-hidden">
          <AccordionTrigger>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
              <Receipt className="h-4 w-4 text-white" />
            </div>
            <span>Steuerliche Parameter</span>
          </AccordionTrigger>
          <AccordionContent>
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

              <Input
                label="Bewegliche Güter (z.B. Einbauküche)"
                type="number"
                value={currentInput.movableAssetsValue ?? 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  updateInput({ movableAssetsValue: isNaN(value) ? 0 : value });
                }}
                suffix="€"
                min={0}
                step={500}
                helpText={helpTexts.movableAssets}
              />

              <Input
                label="Abschreibungsdauer"
                type="number"
                value={currentInput.movableAssetsDepreciationYears ?? 10}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  updateInput({ movableAssetsDepreciationYears: isNaN(value) ? 10 : value });
                }}
                suffix="Jahre"
                min={1}
                max={15}
                helpText={helpTexts.movableAssetsYears}
              />
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>

      {/* Prognose Section */}
      <AccordionItem value="forecast">
        <Card className="overflow-hidden">
          <AccordionTrigger>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span>Prognose</span>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-5 pt-5">
              <Slider
                label="Erwartete Wertsteigerung p.a."
                min={-2}
                max={8}
                step={0.5}
                value={currentInput.expectedAppreciationPercent}
                onChange={(value) => updateInput({ expectedAppreciationPercent: value })}
                formatValue={(v) => `${v}%`}
                helpText={helpTexts.appreciation}
              />

              <Slider
                label="Erwartete Mietsteigerung p.a."
                min={0}
                max={5}
                step={0.5}
                value={currentInput.expectedRentIncreasePercent}
                onChange={(value) => updateInput({ expectedRentIncreasePercent: value })}
                formatValue={(v) => `${v}%`}
                helpText={helpTexts.rentIncrease}
              />

              {/* Info Banner */}
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>Diese Werte beeinflussen die Langzeitprognose in den Charts.</span>
              </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
