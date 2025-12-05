"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useImmoCalcStore } from "@/store";
import { useToast } from "./toast";
import { PropertyInput, AfAType, BundeslandData, Bundesland } from "@/types";
import { Sparkles, X, Building2, Home, Factory, HardHat } from "lucide-react";

/**
 * Preset configuration interface
 */
export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  city: string;
  values: Partial<PropertyInput>;
}

/**
 * Pre-defined presets with realistic German real estate examples
 */
export const PRESETS: Preset[] = [
  {
    id: "munich-apartment",
    name: "ETW München",
    description: "Typische Eigentumswohnung in München-Schwabing",
    icon: <Building2 className="h-5 w-5" />,
    city: "München",
    values: {
      purchasePrice: 450000,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      propertyTransferTaxPercent: 3.5, // Bayern
      renovationCosts: 15000,
      equity: 100000,
      interestRate: 3.8,
      repaymentRate: 2.0,
      fixedInterestPeriod: 15,
      coldRentActual: 1200,
      coldRentTarget: 1350,
      nonRecoverableCosts: 120,
      maintenanceReserve: 80,
      vacancyRiskPercent: 2.0,
      personalTaxRate: 42,
      buildingSharePercent: 80,
      afaType: "ALTBAU_AB_1925" as AfAType,
    },
  },
  {
    id: "berlin-altbau",
    name: "Altbau Berlin",
    description: "Klassischer Altbau in Berlin-Prenzlauer Berg",
    icon: <Home className="h-5 w-5" />,
    city: "Berlin",
    values: {
      purchasePrice: 320000,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      propertyTransferTaxPercent: 6.0, // Berlin
      renovationCosts: 25000,
      equity: 80000,
      interestRate: 3.9,
      repaymentRate: 2.0,
      fixedInterestPeriod: 10,
      coldRentActual: 900,
      coldRentTarget: 1100,
      nonRecoverableCosts: 100,
      maintenanceReserve: 100,
      vacancyRiskPercent: 2.5,
      personalTaxRate: 38,
      buildingSharePercent: 75,
      afaType: "ALTBAU_VOR_1925" as AfAType,
    },
  },
  {
    id: "ruhr-mfh",
    name: "MFH Ruhrgebiet",
    description: "Mehrfamilienhaus in Essen-Werden mit 4 Einheiten",
    icon: <Factory className="h-5 w-5" />,
    city: "Essen",
    values: {
      purchasePrice: 280000,
      brokerPercent: 3.57,
      notaryPercent: 1.5,
      propertyTransferTaxPercent: 6.5, // NRW
      renovationCosts: 30000,
      equity: 70000,
      interestRate: 4.0,
      repaymentRate: 2.5,
      fixedInterestPeriod: 10,
      coldRentActual: 1800,
      coldRentTarget: 2000,
      nonRecoverableCosts: 200,
      maintenanceReserve: 200,
      vacancyRiskPercent: 3.0,
      personalTaxRate: 35,
      buildingSharePercent: 70,
      afaType: "ALTBAU_AB_1925" as AfAType,
    },
  },
  {
    id: "hamburg-neubau",
    name: "Neubau Hamburg",
    description: "Moderne Neubauwohnung in Hamburg-Hafencity",
    icon: <HardHat className="h-5 w-5" />,
    city: "Hamburg",
    values: {
      purchasePrice: 520000,
      brokerPercent: 3.12,
      notaryPercent: 1.5,
      propertyTransferTaxPercent: 5.5, // Hamburg
      renovationCosts: 0,
      equity: 130000,
      interestRate: 3.7,
      repaymentRate: 2.0,
      fixedInterestPeriod: 15,
      coldRentActual: 1400,
      coldRentTarget: 1400,
      nonRecoverableCosts: 100,
      maintenanceReserve: 50,
      vacancyRiskPercent: 1.5,
      personalTaxRate: 42,
      buildingSharePercent: 85,
      afaType: "NEUBAU_AB_2023" as AfAType,
    },
  },
];

/**
 * Get Bundesland key from tax rate (for display purposes)
 */
function getBundeslandFromTaxRate(taxRate: number): string {
  const entry = Object.entries(BundeslandData).find(([, data]) => data.taxRate === taxRate);
  return entry ? BundeslandData[entry[0] as Bundesland].name : "";
}

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
  const bundesland = getBundeslandFromTaxRate(preset.values.propertyTransferTaxPercent || 0);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
        "hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30",
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/50"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-lg p-2 transition-colors",
            isSelected
              ? "bg-indigo-500 text-white dark:bg-indigo-400"
              : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300"
          )}
        >
          {preset.icon}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">{preset.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{preset.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              €{(preset.values.purchasePrice || 0).toLocaleString("de-DE")}
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              €{(preset.values.coldRentActual || 0).toLocaleString("de-DE")}/Monat
            </span>
            {bundesland && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {bundesland}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Preset Selector Modal component
 */
export function PresetSelector({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);
  const { updateInput } = useImmoCalcStore();
  const { addToast } = useToast();

  const handleLoadPreset = () => {
    const preset = PRESETS.find((p) => p.id === selectedPreset);
    if (preset) {
      updateInput(preset.values);
      addToast(`✅ Beispiel "${preset.name}" geladen`, "success");
      onClose();
      setSelectedPreset(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="animate-scale-in relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-500/25 dark:from-indigo-400 dark:to-indigo-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Beispiele laden</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wählen Sie ein Beispiel, um typische Werte zu laden
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Grid */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
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
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            💡 Alle Werte können nach dem Laden angepasst werden
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleLoadPreset} disabled={!selectedPreset}>
              Laden
            </Button>
          </div>
        </div>
      </div>
    </div>
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
