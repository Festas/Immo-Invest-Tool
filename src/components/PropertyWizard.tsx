"use client";

import React, { useState, useMemo } from "react";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WizardLivePreview } from "@/components/WizardLivePreview";
import { useImmoCalcStore } from "@/store";
import { GERMAN_STATES, WIZARD_DEFAULTS } from "@/lib/constants/german-states";
import { AfARates, Bundesland } from "@/types";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "property",
    title: "Objektdaten",
    description: "Grundlegende Informationen",
  },
  {
    id: "financing",
    title: "Finanzierung",
    description: "Eigenkapital und Kredit",
  },
  {
    id: "costs",
    title: "Nebenkosten",
    description: "Kaufnebenkosten",
  },
  {
    id: "rental",
    title: "Miete & Bewirtschaftung",
    description: "Mieteinnahmen und Kosten",
  },
  {
    id: "tax",
    title: "Steuer",
    description: "Steuerliche Angaben",
  },
];

export function PropertyWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [livingArea, setLivingArea] = useState<number>(0);
  const [yearBuilt, setYearBuilt] = useState<number>(new Date().getFullYear());
  const [postalCode, setPostalCode] = useState<string>("");

  const { currentInput, currentOutput, updateInput, calculate } = useImmoCalcStore();

  // Calculate if we have minimum required data for preview
  const hasMinimumData = useMemo(() => {
    return (
      currentInput.purchasePrice > 0 &&
      currentInput.equity >= 0 &&
      currentInput.coldRentActual > 0
    );
  }, [currentInput]);

  // Validate current step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Property data
        return currentInput.purchasePrice > 0;
      case 1: // Financing
        return currentInput.equity >= 0 && currentInput.interestRate > 0;
      case 2: // Costs
        return true; // All fields have defaults
      case 3: // Rental
        return currentInput.coldRentActual > 0;
      case 4: // Tax
        return true; // All fields have defaults
      default:
        return false;
    }
  }, [currentStep, currentInput]);

  const handleComplete = () => {
    calculate();
    // Could show a success message or redirect
  };

  const applySmartDefaults = (section: string) => {
    switch (section) {
      case "costs":
        updateInput({
          brokerPercent: WIZARD_DEFAULTS.brokerPercent,
          notaryPercent: WIZARD_DEFAULTS.notaryPercent,
        });
        break;
      case "rental":
        if (livingArea > 0) {
          updateInput({
            maintenanceReserve: livingArea * WIZARD_DEFAULTS.maintenanceReservePerSqm,
          });
        }
        break;
      case "tax":
        updateInput({
          personalTaxRate: WIZARD_DEFAULTS.personalTaxRate,
          buildingSharePercent: WIZARD_DEFAULTS.buildingSharePercent,
        });
        break;
    }
  };

  const handleBundeslandChange = (bundesland: string) => {
    const state = GERMAN_STATES[bundesland];
    if (state) {
      updateInput({
        bundesland: bundesland as Bundesland,
        propertyTransferTaxPercent: state.taxRate,
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Property data
        return (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Objektdaten eingeben
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Geben Sie die grundlegenden Informationen zur Immobilie ein
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="purchasePrice"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Kaufpreis <span className="text-red-500">*</span>
                </label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={currentInput.purchasePrice || ""}
                  onChange={(e) =>
                    updateInput({ purchasePrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 300000"
                  className={cn(
                    "text-lg",
                    currentInput.purchasePrice === 0 && "border-red-300 dark:border-red-700"
                  )}
                  aria-required="true"
                  aria-invalid={currentInput.purchasePrice === 0}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Der Kaufpreis der Immobilie in Euro (ohne Nebenkosten)
                </p>
                {currentInput.purchasePrice === 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Bitte geben Sie einen Kaufpreis ein
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="livingArea"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Wohnfläche (m²)
                </label>
                <Input
                  id="livingArea"
                  type="number"
                  value={livingArea || ""}
                  onChange={(e) => setLivingArea(parseFloat(e.target.value) || 0)}
                  placeholder="z.B. 75"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wird für die Instandhaltungsrücklage benötigt
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="yearBuilt"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Baujahr
                </label>
                <Input
                  id="yearBuilt"
                  type="number"
                  value={yearBuilt || ""}
                  onChange={(e) => setYearBuilt(parseInt(e.target.value) || new Date().getFullYear())}
                  placeholder="z.B. 1990"
                  min="1800"
                  max={new Date().getFullYear()}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wichtig für die AfA-Berechnung
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="postalCode"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  PLZ / Stadt (optional)
                </label>
                <Input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="z.B. 80331 München"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Für Ihre Unterlagen und spätere Analysen
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 1: // Financing
        return (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Finanzierung planen
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Eigenkapital und Kreditkonditionen festlegen
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="equity"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Eigenkapital <span className="text-red-500">*</span>
                </label>
                <Input
                  id="equity"
                  type="number"
                  value={currentInput.equity || ""}
                  onChange={(e) => updateInput({ equity: parseFloat(e.target.value) || 0 })}
                  placeholder="z.B. 60000"
                  className="text-lg"
                  aria-required="true"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ihr eingesetztes Eigenkapital in Euro (empfohlen: 20-30% der Gesamtkosten)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="interestRate"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Zinssatz (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={currentInput.interestRate || ""}
                  onChange={(e) => updateInput({ interestRate: parseFloat(e.target.value) || 0 })}
                  placeholder="z.B. 3.5"
                  aria-required="true"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Jährlicher Sollzinssatz des Darlehens
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="repaymentRate"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tilgungssatz (%)
                </label>
                <Input
                  id="repaymentRate"
                  type="number"
                  step="0.1"
                  value={currentInput.repaymentRate || ""}
                  onChange={(e) => updateInput({ repaymentRate: parseFloat(e.target.value) || 0 })}
                  placeholder="z.B. 2.0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anfängliche jährliche Tilgung (üblich: 2-3%)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="fixedInterestPeriod"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Zinsbindung (Jahre)
                </label>
                <Input
                  id="fixedInterestPeriod"
                  type="number"
                  value={currentInput.fixedInterestPeriod || ""}
                  onChange={(e) =>
                    updateInput({ fixedInterestPeriod: parseInt(e.target.value) || 10 })
                  }
                  placeholder="z.B. 10"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zeitraum der Zinsbindung (üblich: 5, 10 oder 15 Jahre)
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Costs
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Nebenkosten
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Kaufnebenkosten und Renovierung
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySmartDefaults("costs")}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Typische Werte
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="bundesland"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Bundesland
                </label>
                <Select
                  id="bundesland"
                  value={currentInput.bundesland || "BAYERN"}
                  onChange={(e) => handleBundeslandChange(e.target.value)}
                  options={Object.entries(GERMAN_STATES).map(([key, state]) => ({
                    value: key,
                    label: `${state.name} (${state.taxRate}%)`,
                  }))}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bestimmt die Grunderwerbsteuer (wird automatisch gesetzt)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="propertyTransferTax"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Grunderwerbsteuer (%)
                </label>
                <Input
                  id="propertyTransferTax"
                  type="number"
                  step="0.1"
                  value={currentInput.propertyTransferTaxPercent || ""}
                  onChange={(e) =>
                    updateInput({ propertyTransferTaxPercent: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Automatisch basierend auf Bundesland"
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wird automatisch basierend auf dem ausgewählten Bundesland gesetzt
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="brokerPercent"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Maklergebühr (%)
                </label>
                <Input
                  id="brokerPercent"
                  type="number"
                  step="0.01"
                  value={currentInput.brokerPercent || ""}
                  onChange={(e) => updateInput({ brokerPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="z.B. 3.57"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maklerprovision (üblich: 0-3,57%, oft geteilt mit Verkäufer)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="notaryPercent"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Notarkosten (%)
                </label>
                <Input
                  id="notaryPercent"
                  type="number"
                  step="0.1"
                  value={currentInput.notaryPercent || ""}
                  onChange={(e) => updateInput({ notaryPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="z.B. 1.5"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notar- und Grundbuchkosten (üblich: 1,5-2%)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="renovationCosts"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Renovierungskosten (€)
                </label>
                <Input
                  id="renovationCosts"
                  type="number"
                  value={currentInput.renovationCosts || ""}
                  onChange={(e) =>
                    updateInput({ renovationCosts: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 15000"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Geplante Renovierungskosten nach dem Kauf
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3: // Rental
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Miete & Bewirtschaftung
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Mieteinnahmen und laufende Kosten
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySmartDefaults("rental")}
                  className="gap-2"
                  disabled={livingArea === 0}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Typische Werte
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="coldRentActual"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Kaltmiete IST (€/Monat) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="coldRentActual"
                  type="number"
                  value={currentInput.coldRentActual || ""}
                  onChange={(e) =>
                    updateInput({ coldRentActual: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 1200"
                  className={cn(
                    "text-lg",
                    currentInput.coldRentActual === 0 && "border-red-300 dark:border-red-700"
                  )}
                  aria-required="true"
                  aria-invalid={currentInput.coldRentActual === 0}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aktuelle oder erwartete monatliche Kaltmiete
                </p>
                {currentInput.coldRentActual === 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Bitte geben Sie die Kaltmiete ein
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="coldRentTarget"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Kaltmiete SOLL (€/Monat)
                </label>
                <Input
                  id="coldRentTarget"
                  type="number"
                  value={currentInput.coldRentTarget || ""}
                  onChange={(e) =>
                    updateInput({ coldRentTarget: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Optional - für Potenzialanalyse"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zukünftig erreichbare Miete (optional)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="nonRecoverableCosts"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Nicht umlagefähige Nebenkosten (€/Monat)
                </label>
                <Input
                  id="nonRecoverableCosts"
                  type="number"
                  value={currentInput.nonRecoverableCosts || ""}
                  onChange={(e) =>
                    updateInput({ nonRecoverableCosts: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 50"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monatliche Kosten, die nicht auf Mieter umgelegt werden können
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="maintenanceReserve"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Instandhaltungsrücklage (€/Jahr)
                </label>
                <Input
                  id="maintenanceReserve"
                  type="number"
                  value={currentInput.maintenanceReserve || ""}
                  onChange={(e) =>
                    updateInput({ maintenanceReserve: parseFloat(e.target.value) || 0 })
                  }
                  placeholder={
                    livingArea > 0 ? `z.B. ${livingArea * 10} (${livingArea}m² × 10€)` : "z.B. 750"
                  }
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Jährliche Rücklage für Instandhaltung (Faustregel: 10€/m²/Jahr)
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4: // Tax
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Steuerliche Angaben
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Für die Steuerberechnung
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySmartDefaults("tax")}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Typische Werte
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="personalTaxRate"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Persönlicher Steuersatz (%)
                </label>
                <Input
                  id="personalTaxRate"
                  type="number"
                  step="1"
                  value={currentInput.personalTaxRate || ""}
                  onChange={(e) =>
                    updateInput({ personalTaxRate: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 42"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ihr persönlicher Grenzsteuersatz (0-45%)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="buildingSharePercent"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Gebäudeanteil (%)
                </label>
                <Input
                  id="buildingSharePercent"
                  type="number"
                  step="1"
                  value={currentInput.buildingSharePercent || ""}
                  onChange={(e) =>
                    updateInput({ buildingSharePercent: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="z.B. 80"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anteil des Gebäudewerts am Kaufpreis (üblich: 70-85%)
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="afaType"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  AfA-Typ
                </label>
                <Select
                  id="afaType"
                  value={currentInput.afaType}
                  onChange={(e) => updateInput({ afaType: e.target.value as any })}
                  options={Object.entries(AfARates).map(([key, data]) => ({
                    value: key,
                    label: data.label,
                  }))}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Art der Abschreibung basierend auf Baujahr
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Wizard
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          canGoNext={canProceed}
          canGoPrevious={true}
        >
          {renderStepContent()}
        </Wizard>
      </div>
      <div className="lg:col-span-1">
        <WizardLivePreview output={currentOutput} isComplete={hasMinimumData} />
      </div>
    </div>
  );
}
