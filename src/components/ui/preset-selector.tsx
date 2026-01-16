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
      "Schwerin: Wohnung von Großeltern kaufen – 0% GrESt, 0% Makler, 33% unter Marktwert",
    icon: "🏠",
    bundesland: "Mecklenburg-Vorpommern",
    values: {
      // Bundesland
      bundesland: "MECKLENBURG_VORPOMMERN",

      // Kaufpreis & Nebenkosten - deutlich unter Marktwert (33% Discount)
      purchasePrice: 120000,
      marketValue: 180000,
      isFamilyPurchase: true,
      propertyTransferTaxPercent: 0, // Family exemption
      brokerPercent: 0, // No broker for family deals
      notaryPercent: 1.5, // Only notary costs
      renovationCosts: 2000, // Minor cosmetic refresh

      // Finanzierung - Conservative with good equity ratio
      // Side costs: 120000 * 1.5% + 2000 = 3,800€
      // Total: 120000 + 3800 = 123,800€
      equity: 25000, // ~20% of total
      loanAmount: 98800, // 123,800 - 25,000
      interestRate: 3.2,
      repaymentRate: 2.5, // Good repayment for faster payoff
      fixedInterestPeriod: 15,

      // Mieteinnahmen - realistic for 65m² in Schwerin
      coldRentActual: 520,
      coldRentTarget: 520,
      nonRecoverableCosts: 45,
      maintenanceReserve: 65,
      vacancyRiskPercent: 2, // Low risk due to affordable rent

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 85,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - Conservative for MV
      expectedAppreciationPercent: 1.0,
      expectedRentIncreasePercent: 1.0,
    },
  },

  // ============================================
  // 2. DIE "WARNUNG" (Negativ-Beispiel)
  // ============================================
  // Logic: Looks nice on paper but terrible ROI
  // Characteristics: Faktor > 35, negative cashflow, bad energy efficiency implied by high costs
  {
    id: "warning-duesseldorf",
    name: "⚠️ Die Warnung",
    description: "Düsseldorf: Schick, aber viel zu teuer – Faktor 42, negativer Cashflow",
    icon: "⚠️",
    bundesland: "Nordrhein-Westfalen",
    values: {
      // Bundesland
      bundesland: "NORDRHEIN_WESTFALEN",

      // Kaufpreis - Overpriced: 420,000€ for only 700€ rent = Faktor 50!
      purchasePrice: 420000,
      marketValue: 400000, // Even above market value - overpaying!
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 6.5, // NRW has highest rate
      brokerPercent: 3.57, // Full broker commission
      notaryPercent: 2.0,
      renovationCosts: 0, // "Move-in ready" they said...

      // Finanzierung
      // Side costs: 420000 * (6.5% + 3.57% + 2%) = 50,694€
      // Total: 420000 + 50,694 = 470,694€
      equity: 50000, // Low equity ratio
      loanAmount: 420694, // High leverage
      interestRate: 3.8, // Higher rate due to risk profile
      repaymentRate: 1.5, // Low repayment stretches loan
      fixedInterestPeriod: 10,

      // Mieteinnahmen - Way too low for price
      coldRentActual: 700, // Only 700€ for 420k purchase = terrible ratio
      coldRentTarget: 750,
      nonRecoverableCosts: 180, // High Hausgeld, bad energy efficiency
      maintenanceReserve: 120,
      vacancyRiskPercent: 3,

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 70, // Lower building share
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - Even optimistic assumptions can't save this
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
    description: "München Schwabing: Negative Cashflow, aber Premium-Lage für steuerfreien Verkauf",
    icon: "📈",
    bundesland: "Bayern",
    values: {
      // Bundesland
      bundesland: "BAYERN",

      // Kaufpreis - High price but strong location
      purchasePrice: 650000,
      marketValue: 680000, // Buying slightly under market
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 3.5, // Bayern lowest rate!
      brokerPercent: 3.0, // Standard Munich
      notaryPercent: 1.5,
      renovationCosts: 0, // Top condition

      // Finanzierung
      // Side costs: 650000 * (3.5% + 3% + 1.5%) = 52,000€
      // Total: 650000 + 52,000 = 702,000€
      equity: 150000, // Solid equity
      loanAmount: 552000,
      interestRate: 3.4,
      repaymentRate: 1.5, // Low repayment to manage cashflow
      fixedInterestPeriod: 15,

      // Mieteinnahmen - Low yield typical for Munich
      coldRentActual: 1650, // Good rent but still low yield for price
      coldRentTarget: 1800,
      nonRecoverableCosts: 120,
      maintenanceReserve: 80, // Modern building, low maintenance
      vacancyRiskPercent: 1, // Minimal vacancy in Munich

      // Steuern
      personalTaxRate: 42,
      buildingSharePercent: 75,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - The bet: high appreciation
      expectedAppreciationPercent: 3.5, // Munich premium
      expectedRentIncreasePercent: 2.5, // Strong rental growth
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
    description: "Leipzig Lindenau: Unter Marktmiete vermietet – Potenzial durch Mietanpassung",
    icon: "🔧",
    bundesland: "Sachsen",
    values: {
      // Bundesland
      bundesland: "SACHSEN",

      // Kaufpreis - Reasonable for the location
      purchasePrice: 195000,
      marketValue: 210000, // Fair deal
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.5,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      renovationCosts: 25000, // Key: Renovation budget for value-add

      // Finanzierung
      // Side costs: 195000 * (5.5% + 3.57% + 1.5%) + 25000 = 45,600€
      // Total: 195000 + 45,600 = 240,600€
      equity: 60000,
      loanAmount: 180600,
      interestRate: 3.5,
      repaymentRate: 2.0,
      fixedInterestPeriod: 10,

      // Mieteinnahmen - KEY: Currently under-rented!
      coldRentActual: 480, // Old tenant, way below market
      coldRentTarget: 750, // Market potential after renovation/new tenant
      nonRecoverableCosts: 80,
      maintenanceReserve: 100,
      vacancyRiskPercent: 5, // Account for renovation vacancy

      // Steuern
      personalTaxRate: 35, // Mid-income investor
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose
      expectedAppreciationPercent: 2.5, // Leipzig growing
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
    description:
      "Halle (Saale): Kaufpreis 75.000€, 7,5% Brutto-Rendite – positiver Cashflow ab Tag 1",
    icon: "💰",
    bundesland: "Sachsen-Anhalt",
    values: {
      // Bundesland
      bundesland: "SACHSEN_ANHALT",

      // Kaufpreis - Very affordable
      purchasePrice: 75000,
      marketValue: 80000,
      isFamilyPurchase: false,
      propertyTransferTaxPercent: 5.0,
      brokerPercent: 3.0, // Lower broker for cheap properties
      notaryPercent: 1.5,
      renovationCosts: 5000, // Minor refresh

      // Finanzierung
      // Side costs: 75000 * (5% + 3% + 1.5%) + 5000 = 12,125€
      // Total: 75000 + 12,125 = 87,125€
      equity: 20000, // Manageable entry point
      loanAmount: 67125,
      interestRate: 4.0, // Slightly higher for smaller loan
      repaymentRate: 3.0, // Aggressive payoff
      fixedInterestPeriod: 10,

      // Mieteinnahmen - Great ratio!
      coldRentActual: 470, // 470€ for 75k = Faktor 13.3 = excellent!
      coldRentTarget: 500,
      nonRecoverableCosts: 55,
      maintenanceReserve: 75, // Older building needs reserves
      vacancyRiskPercent: 4, // C-location risk

      // Steuern
      personalTaxRate: 35,
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,

      // Prognose - Conservative, focus is on cashflow not appreciation
      expectedAppreciationPercent: 0.5, // C-location, minimal growth
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
