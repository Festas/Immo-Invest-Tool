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

  return (
    <div className="space-y-4">
      {/* Purchase & Costs Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-blue-600" />
            Kaufpreis & Nebenkosten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Kaufpreis"
            type="number"
            value={currentInput.purchasePrice}
            onChange={handlePurchasePriceChange}
            suffix="€"
            min={0}
            step={1000}
          />

          <Select
            label="Bundesland"
            options={bundeslandOptions}
            value={Object.keys(BundeslandData).find(
              (key) => BundeslandData[key as Bundesland].taxRate === currentInput.propertyTransferTaxPercent
            ) || "BAYERN"}
            onChange={handleBundeslandChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Makler"
              type="number"
              value={currentInput.brokerPercent}
              onChange={(e) => updateInput({ brokerPercent: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0}
              max={10}
              step={0.01}
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
          />
        </CardContent>
      </Card>

      {/* Financing Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-5 w-5 text-green-600" />
            Finanzierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            label="Eigenkapital"
            min={0}
            max={currentInput.purchasePrice}
            step={1000}
            value={currentInput.equity}
            onChange={(value) => updateInput({ equity: value })}
            formatValue={(v) => `€${v.toLocaleString("de-DE")}`}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Zinssatz"
              type="number"
              value={currentInput.interestRate}
              onChange={(e) => updateInput({ interestRate: parseFloat(e.target.value) || 0 })}
              suffix="%"
              min={0}
              max={15}
              step={0.1}
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
          />
        </CardContent>
      </Card>

      {/* Rental Income Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-orange-600" />
            Mieteinnahmen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Kaltmiete (IST) monatlich"
            type="number"
            value={currentInput.coldRentActual}
            onChange={(e) => updateInput({ coldRentActual: parseFloat(e.target.value) || 0 })}
            suffix="€"
            min={0}
            step={50}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nicht umlegbare NK"
              type="number"
              value={currentInput.nonRecoverableCosts}
              onChange={(e) => updateInput({ nonRecoverableCosts: parseFloat(e.target.value) || 0 })}
              suffix="€"
              min={0}
              step={10}
            />
            <Input
              label="Instandhaltung"
              type="number"
              value={currentInput.maintenanceReserve}
              onChange={(e) => updateInput({ maintenanceReserve: parseFloat(e.target.value) || 0 })}
              suffix="€"
              min={0}
              step={10}
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
          />
        </CardContent>
      </Card>

      {/* Tax Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-purple-600" />
            Steuerliche Parameter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="AfA-Typ"
            options={afaOptions}
            value={currentInput.afaType}
            onChange={(value) => updateInput({ afaType: value as AfAType })}
          />

          <Slider
            label="Gebäudeanteil"
            min={50}
            max={95}
            step={1}
            value={currentInput.buildingSharePercent}
            onChange={(value) => updateInput({ buildingSharePercent: value })}
            formatValue={(v) => `${v}%`}
          />

          <Slider
            label="Persönlicher Grenzsteuersatz"
            min={0}
            max={45}
            step={1}
            value={currentInput.personalTaxRate}
            onChange={(value) => updateInput({ personalTaxRate: value })}
            formatValue={(v) => `${v}%`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
