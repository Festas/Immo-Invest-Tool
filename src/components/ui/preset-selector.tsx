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
 * Pre-defined presets with realistic Northern Germany real estate examples
 */
export const PRESETS: Preset[] = [
  {
    id: "family-schwerin",
    name: "Familienkauf Schwerin",
    description: "Wohnung von Großeltern kaufen - steuerbegünstigt & unter Marktwert",
    icon: "🏠",
    bundesland: "Mecklenburg-Vorpommern",
    values: {
      // Kaufpreis & Nebenkosten
      purchasePrice: 160000,
      marketValue: 240000,
      isFamilyPurchase: true,
      propertyTransferTaxPercent: 0,
      brokerPercent: 0,
      notaryPercent: 2,
      renovationCosts: 500,

      // Finanzierung - Loan is full purchase price, side costs from equity
      equity: 3700,
      loanAmount: 160000, // Full purchase price - side costs paid from equity
      interestRate: 3.0,
      repaymentRate: 2.25,
      fixedInterestPeriod: 10,

      // Mieteinnahmen
      coldRentActual: 900,
      coldRentTarget: 900,
      nonRecoverableCosts: 69,
      maintenanceReserve: 95,
      vacancyRiskPercent: 2,

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 95,
      afaType: "ALTBAU_VOR_1925" as AfAType,
    },
  },
  {
    id: "apartment-rostock",
    name: "ETW Rostock",
    description: "Eigentumswohnung in der Hansestadt - solide Rendite an der Ostsee",
    icon: "🏢",
    bundesland: "Mecklenburg-Vorpommern",
    values: {
      purchasePrice: 185000,
      marketValue: 195000, // Slightly above purchase price
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 6.0,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      renovationCosts: 5000,

      // Side costs: 185000 * (6% + 3.57% + 1.5%) + 5000 = ~25,500
      // Total: 185000 + 25500 = 210,500
      // Loan: 210500 - 45000 = 165,500
      equity: 45000,
      loanAmount: 165500, // Calculated
      interestRate: 3.5,
      repaymentRate: 2.0,
      fixedInterestPeriod: 10,

      coldRentActual: 750,
      coldRentTarget: 750,
      nonRecoverableCosts: 60,
      maintenanceReserve: 80,
      vacancyRiskPercent: 3,

      personalTaxRate: 42, // Changed from 35%
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,
    },
  },
  {
    id: "mfh-luebeck",
    name: "MFH Lübeck",
    description: "Mehrfamilienhaus in der Altstadt - 4 Einheiten, stabiler Cashflow",
    icon: "🏘️",
    bundesland: "Schleswig-Holstein",
    values: {
      purchasePrice: 420000,
      marketValue: 450000,
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 6.5,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      renovationCosts: 15000,

      // Side costs: 420000 * (6.5% + 3.57% + 1.5%) + 15000 = ~63,500
      // Total: 420000 + 63500 = 483,500
      // Loan: 483500 - 120000 = 363,500
      equity: 120000,
      loanAmount: 363500, // Calculated
      interestRate: 3.4,
      repaymentRate: 2.0,
      fixedInterestPeriod: 15,

      coldRentActual: 2400,
      coldRentTarget: 2600,
      nonRecoverableCosts: 180,
      maintenanceReserve: 250,
      vacancyRiskPercent: 3,

      personalTaxRate: 42,
      buildingSharePercent: 75,
      afaType: "ALTBAU_AB_1925" as AfAType,
    },
  },
  {
    id: "neubau-hamburg",
    name: "Neubau Hamburg",
    description: "Neubauwohnung in Hamburg - Premium-Lage mit Wertsteigerungspotenzial",
    icon: "🏗️",
    bundesland: "Hamburg",
    values: {
      purchasePrice: 480000,
      marketValue: 510000,
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.5,
      brokerPercent: 3.0,
      notaryPercent: 1.5,
      renovationCosts: 0,

      // Side costs: 480000 * (5.5% + 3% + 1.5%) + 0 = 48,000
      // Total: 480000 + 48000 = 528,000
      // Loan: 528000 - 130000 = 398,000
      equity: 130000,
      loanAmount: 398000, // Calculated
      interestRate: 3.3,
      repaymentRate: 2.5,
      fixedInterestPeriod: 15,

      coldRentActual: 1350,
      coldRentTarget: 1400,
      nonRecoverableCosts: 80,
      maintenanceReserve: 50,
      vacancyRiskPercent: 2,

      personalTaxRate: 42,
      buildingSharePercent: 85,
      afaType: "NEUBAU_AB_2023" as AfAType,
    },
  },
  {
    id: "cashflow-bremen",
    name: "Cashflow-Objekt Bremen",
    description: "Renditestarke Wohnung in Bremen-Nord - positiver Cashflow ab Tag 1",
    icon: "💰",
    bundesland: "Bremen",
    values: {
      purchasePrice: 95000,
      marketValue: 100000,
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.0,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      renovationCosts: 8000,

      // Side costs: 95000 * (5% + 3.57% + 1.5%) + 8000 = ~17,570
      // Total: 95000 + 17570 = 112,570
      // Loan: 112570 - 25000 = 87,570
      equity: 25000,
      loanAmount: 87570, // Calculated
      interestRate: 3.8,
      repaymentRate: 2.0,
      fixedInterestPeriod: 10,

      coldRentActual: 520,
      coldRentTarget: 550,
      nonRecoverableCosts: 50,
      maintenanceReserve: 70,
      vacancyRiskPercent: 4,

      personalTaxRate: 42, // Changed from 35%
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,
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
