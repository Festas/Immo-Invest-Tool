"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useImmoCalcStore } from "@/store";
import { useToast } from "./toast";
import { PropertyInput, AfAType } from "@/types";
import { Sparkles, X, Lightbulb } from "lucide-react";

/**
 * Preset configuration interface
 */
export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  bundesland: string;
  values: Partial<PropertyInput>;
}

/**
 * Get Bundesland abbreviation for display
 */
function getBundeslandAbbreviation(bundesland: string): string {
  const abbreviations: Record<string, string> = {
    "Mecklenburg-Vorpommern": "MV",
    "Schleswig-Holstein": "SH",
    Hamburg: "HH",
    Bremen: "HB",
    Niedersachsen: "NI",
    "Baden-Württemberg": "BW",
    Bayern: "BY",
    Berlin: "BE",
    Brandenburg: "BB",
    Hessen: "HE",
    "Nordrhein-Westfalen": "NW",
    "Rheinland-Pfalz": "RP",
    Saarland: "SL",
    Sachsen: "SN",
    "Sachsen-Anhalt": "ST",
    Thüringen: "TH",
  };
  return abbreviations[bundesland] || bundesland;
}

/**
 * Pre-defined presets with 5 didactic investment archetypes
 * These examples teach users how the tool reacts to different scenarios
 */
export const PRESETS: Preset[] = [
  // ============================================
  // 1. DER FAMILIEN-DEAL (Basis: Schwerin)
  // ============================================
  // Status: Real case - low-risk family purchase
  // Logic: Discounted purchase from family, no broker, no property transfer tax
  {
    id: "family-schwerin",
    name: "🏠 Der Familien-Deal",
    description:
      "Schwerin Zentrum: Wohnung von Oma kaufen – 0% GrESt, 0% Makler, 33% unter Marktwert, Verkäuferdarlehen",
    icon: "🏠",
    bundesland: "Mecklenburg-Vorpommern",
    values: {
      // Bundesland
      bundesland: "MECKLENBURG_VORPOMMERN",

      // Kaufpreis & Nebenkosten - 33% unter Marktwert
      purchasePrice: 160000,
      marketValue: 240000,
      isFamilyPurchase: true,
      propertyTransferTaxPercent: 0, // Familienbefreiung
      brokerPercent: 0, // Kein Makler bei Familienkauf
      notaryPercent: 2.5, // Nur Notarkosten (ergibt ~4000€)
      renovationCosts: 0,

      // Finanzierung - Verkäuferdarlehen von Oma
      // Kaufnebenkosten: 160000 * 2.5% = 4000€
      // Eigenkapital deckt nur Nebenkosten
      // Darlehen: 160000€ (100% Kaufpreisfinanzierung)
      equity: 4000,
      loanAmount: 160000,
      interestRate: 3.0, // Familienzins fix bis Ende
      repaymentRate: 2.25,
      fixedInterestPeriod: 30, // Zinsbindung bis Ende

      // Mieteinnahmen - 95m² Wohnung
      coldRentActual: 1000, // 10,53€/m² bei 95m²
      coldRentTarget: 1000,
      nonRecoverableCosts: 69, // Hausgeld (Verwalter, Kontoführung, WEG-Rücklage)
      maintenanceReserve: 100, // Eigene Sicherheitsrücklage
      vacancyRiskPercent: 2, // Niedriges Risiko durch günstige Miete

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 95,
      afaType: "ALTBAU_VOR_1925" as AfAType, // 2,5% AfA

      // Bewegliche Güter (Küchen-AfA Feature)
      movableAssetsValue: 5000, // Einbauküche
      movableAssetsDepreciationYears: 10, // 10 Jahre Abschreibung

      // Prognose - Konservativ für MV
      expectedAppreciationPercent: 1.0,
      expectedRentIncreasePercent: 1.0,
    },
  },

  // ============================================
  // 2. DIE "WARNUNG" (Negativ-Beispiel)
  // ============================================
  // Logic: Looks nice on paper but terrible ROI
  // Characteristics: Faktor 37, negative cashflow, bad energy efficiency implied by high costs
  {
    id: "warning-duesseldorf",
    name: "⚠️ Die Warnung",
    description:
      "Düsseldorf Oberkassel: Schick, aber Faktor 37 – massiv negativer Cashflow trotz guter Lage",
    icon: "⚠️",
    bundesland: "Nordrhein-Westfalen",
    values: {
      // Bundesland
      bundesland: "NORDRHEIN_WESTFALEN",

      // Kaufpreis - Overpriced: 380.000€ für 60m² = viel zu teuer
      // Kaufpreisfaktor: 380.000 / (850 * 12) = 37 (schlecht!)
      purchasePrice: 380000,
      marketValue: 360000, // 5% über Marktwert - überteuert!
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 6.5, // NRW höchster Satz
      brokerPercent: 3.57, // Volle Maklercourtage
      notaryPercent: 2.0,
      renovationCosts: 0, // "Bezugsfertig" - keine Renovierung eingeplant

      // Finanzierung
      // Nebenkosten: 380.000 * (6.5% + 3.57% + 2%) = 45.866€
      // Gesamtinvestition: 380.000 + 45.866 = 425.866€
      // Eigenkapital: 50.000€ (nur ~12% - sehr wenig!)
      // Darlehen: 375.866€
      equity: 50000,
      loanAmount: 375866,
      interestRate: 4.0, // Höherer Zins wegen Risikoprofil
      repaymentRate: 1.5, // Niedrige Tilgung
      fixedInterestPeriod: 10,
      // Rate: 375.866 * 5.5% / 12 = ~1.723€/Monat

      // Mieteinnahmen - 60m² Wohnung
      coldRentActual: 850, // 14,17€/m² - marktüblich für Düsseldorf
      coldRentTarget: 900,
      nonRecoverableCosts: 150, // Hohes Hausgeld, Altbau
      maintenanceReserve: 100,
      vacancyRiskPercent: 3,
      // Cashflow: 850 - 1.723 - 150 - 100 = ~ -1.123€ (stark negativ!)

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 70,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - selbst optimistische Annahmen retten das nicht
      expectedAppreciationPercent: 2.0,
      expectedRentIncreasePercent: 1.5,
    },
  },

  // ============================================
  // 3. DAS "WERTSTEIGERUNGS-PLAY" (Spekulation)
  // ============================================
  // Logic: Classic A-location, negative cashflow but betting on appreciation
  // Characteristics: Munich, expensive, low initial yield, hope for 10-year tax-free gain
  {
    id: "appreciation-munich",
    name: "📈 Das Wertsteigerungs-Play",
    description:
      "München Schwabing: Leicht negativer Cashflow, aber Premium-Lage für steuerfreien Verkauf nach 10 Jahren",
    icon: "📈",
    bundesland: "Bayern",
    values: {
      // Bundesland
      bundesland: "BAYERN",

      // Kaufpreis - 50m² in Schwabing, Premium-Lage
      purchasePrice: 450000,
      marketValue: 470000, // Leicht unter Marktwert gekauft
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 3.5, // Bayern niedrigster Satz!
      brokerPercent: 3.0,
      notaryPercent: 1.5,
      renovationCosts: 0, // Top-Zustand

      // Finanzierung - wohlhabender Investor mit viel Eigenkapital
      // Nebenkosten: 450.000 * (3.5% + 3% + 1.5%) = 36.000€
      // Gesamtinvestition: 450.000 + 36.000 = 486.000€
      // Eigenkapital: 180.000€ (~37% - solide!)
      // Darlehen: 306.000€
      equity: 180000,
      loanAmount: 306000,
      interestRate: 3.5,
      repaymentRate: 2.0,
      fixedInterestPeriod: 15,
      // Rate: 306.000 * 5.5% / 12 = ~1.403€/Monat

      // Mieteinnahmen - 50m² Premium
      coldRentActual: 1250, // 25€/m² - München Premium
      coldRentTarget: 1400,
      nonRecoverableCosts: 100,
      maintenanceReserve: 80, // Neuwertiger Zustand
      vacancyRiskPercent: 1, // Minimales Leerstandsrisiko in München
      // Cashflow: 1.250 - 1.403 - 100 - 80 = ~ -333€ (leicht negativ, tragbar)

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 75,
      afaType: "NEUBAU_AB_2023" as AfAType, // Neubau = 3% AfA

      // Prognose - Die Wette: hohe Wertsteigerung
      expectedAppreciationPercent: 3.5, // München Premium
      expectedRentIncreasePercent: 2.5, // Starkes Mietwachstum
    },
  },

  // ============================================
  // 4. DER "TURNAROUND" (Management-Intensiv)
  // ============================================
  // Logic: Hidden potential - under-rented, needs work
  // Characteristics: Bad numbers now, but simulate rent increase to see potential
  {
    id: "turnaround-leipzig",
    name: "🔧 Der Turnaround",
    description:
      "Leipzig Lindenau: Aktuell unter Marktmiete – von -150€ auf +100€ Cashflow durch Mietanpassung",
    icon: "🔧",
    bundesland: "Sachsen",
    values: {
      // Bundesland
      bundesland: "SACHSEN",

      // Kaufpreis - 70m² Altbau, günstiger Einstieg
      purchasePrice: 140000,
      marketValue: 155000, // Unter Marktwert
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.5,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      renovationCosts: 10000, // Kosmetische Renovierung

      // Finanzierung
      // Nebenkosten: 140.000 * (5.5% + 3.57% + 1.5%) + 10.000 = 24.798€
      // Gesamtinvestition: 140.000 + 24.798 = 164.798€
      // Eigenkapital: 45.000€ (~27%)
      // Darlehen: 119.798€
      equity: 45000,
      loanAmount: 119798,
      interestRate: 3.8,
      repaymentRate: 2.0,
      fixedInterestPeriod: 10,
      // Rate: 119.798 * 5.8% / 12 = ~579€/Monat

      // Mieteinnahmen - KEY: Aktuell unter Marktmiete!
      coldRentActual: 490, // Altmieter zahlt nur 7€/m² (70m²)
      coldRentTarget: 700, // Marktmiete wäre 10€/m² (70m²)
      nonRecoverableCosts: 70,
      maintenanceReserve: 80,
      vacancyRiskPercent: 4,
      // Cashflow aktuell: 490 - 579 - 70 - 80 = ~ -239€ (negativ)
      // Cashflow nach Mietanpassung: 700 - 579 - 70 - 80 = ~ -29€ → mit Steuereffekt leicht positiv!

      // Steuern
      personalTaxRate: 35, // Mittelverdiener
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose
      expectedAppreciationPercent: 2.5, // Leipzig wächst
      expectedRentIncreasePercent: 2.0,
    },
  },

  // ============================================
  // 5. DER "CASHFLOW-NO-BRAINER"
  // ============================================
  // Logic: High-yield C-location, positive cashflow from day 1
  // Characteristics: Cheap purchase, high rent ratio, immediate returns
  {
    id: "cashflow-halle",
    name: "💰 Der Cashflow-No-Brainer",
    description: "Halle (Saale): 65.000€ Kaufpreis, Faktor 12 – positiver Cashflow ab Tag 1!",
    icon: "💰",
    bundesland: "Sachsen-Anhalt",
    values: {
      // Bundesland
      bundesland: "SACHSEN_ANHALT",

      // Kaufpreis - Sehr günstig! 45m² für 65.000€
      // Kaufpreisfaktor: 65.000 / (450 * 12) = 12 (exzellent!)
      purchasePrice: 65000,
      marketValue: 70000, // Leicht unter Marktwert
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.0,
      brokerPercent: 3.0, // Günstiger Makler
      notaryPercent: 1.5,
      renovationCosts: 0, // Bezugsfertig

      // Finanzierung
      // Nebenkosten: 65.000 * (5% + 3% + 1.5%) = 6.175€
      // Gesamtinvestition: 65.000 + 6.175 = 71.175€
      // Eigenkapital: 25.000€ (~35% - solide!)
      // Darlehen: 46.175€
      equity: 25000,
      loanAmount: 46175,
      interestRate: 4.2, // Etwas höher für kleine Summe
      repaymentRate: 2.5,
      fixedInterestPeriod: 10,
      // Rate: 46.175 * 6.7% / 12 = ~258€/Monat

      // Mieteinnahmen - Gutes Verhältnis!
      coldRentActual: 450, // 10€/m² bei 45m² - realistisch für Halle
      coldRentTarget: 480,
      nonRecoverableCosts: 45, // Günstiges Hausgeld
      maintenanceReserve: 60, // Rücklage für Altbau
      vacancyRiskPercent: 5, // C-Lage Risiko
      // Cashflow: 450 - 258 - 45 - 60 = +87€ (POSITIV!)

      // Steuern
      personalTaxRate: 35,
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - Konservativ, Fokus ist Cashflow nicht Wertsteigerung
      expectedAppreciationPercent: 0.5, // C-Lage, minimales Wachstum
      expectedRentIncreasePercent: 1.0,
    },
  },
];

/**
 * Preset Card component
 */
function PresetCard({
  preset,
  onSelect,
  isSelected,
}: {
  preset: Preset;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const bundeslandAbbr = getBundeslandAbbreviation(preset.bundesland);
  const marketValue = preset.values.marketValue;
  const purchasePrice = preset.values.purchasePrice || 0;
  const belowMarketPercent =
    marketValue && marketValue > purchasePrice
      ? Math.round(((marketValue - purchasePrice) / marketValue) * 100)
      : 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative min-h-[80px] w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
        "hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30",
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/50"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl transition-colors",
            isSelected
              ? "bg-indigo-500 dark:bg-indigo-400"
              : "bg-indigo-100 group-hover:bg-indigo-200 dark:bg-indigo-900"
          )}
        >
          {preset.icon}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">{preset.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{preset.description}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            €{purchasePrice.toLocaleString("de-DE")} · €
            {(preset.values.coldRentActual || 0).toLocaleString("de-DE")}/Monat · {bundeslandAbbr}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {preset.values.isFamilyPurchase && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                🏷️ 0% GrESt
              </span>
            )}
            {belowMarketPercent > 0 && (
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                📉 {belowMarketPercent}% unter Marktwert
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Preset Selector Modal component - Uses Portal for proper overlay
 */
export function PresetSelector({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const { updateInput } = useImmoCalcStore();
  const { addToast } = useToast();

  // Ensure we only render portal on client side
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLoadPreset = () => {
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    if (preset) {
      updateInput(preset.values);
      addToast(`✅ Beispiel "${preset.name}" geladen`, "success");
      onClose();
      setSelectedPreset(null);
    }
  };

  // Don't render anything if not open or not mounted (SSR safety)
  if (!isOpen || !mounted) return null;

  // Use Portal to render modal at document.body level
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-modal-title"
    >
      {/* Backdrop - covers entire screen */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - truly centered on screen */}
      <div className="animate-scale-in relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2
                id="preset-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Beispiel auswählen
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Beispiele aus Norddeutschland
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset List - Scrollable */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => setSelectedPreset(preset.id)}
              isSelected={selectedPreset === preset.id}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Lightbulb className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">
                Alle Werte können nach dem Laden angepasst werden
              </span>
              <span className="sm:hidden">Werte anpassbar</span>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleLoadPreset} disabled={!selectedPreset}>
                Laden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body // <-- KEY FIX: Render to document.body, not as child of button
  );
}

/**
 * Preset Button component for triggering the modal
 */
export function PresetButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)} className="group">
        <Sparkles className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline">Beispiele laden</span>
        <span className="sm:hidden">Beispiele</span>
      </Button>
      <PresetSelector isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
