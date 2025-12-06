/**
 * ImmoCalc Pro - Zustand Store
 *
 * Central state management for the application
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PropertyInput,
  PropertyOutput,
  Property,
  Scenario,
  PortfolioSummary,
  AfAType,
} from "@/types";
import { calculatePropertyKPIs, getDefaultPropertyInput } from "@/lib/calculations";

/**
 * Generate a UUID that works in all environments
 * Falls back to a simple implementation if crypto.randomUUID is not available
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ImmoCalcState {
  // Current calculator input
  currentInput: PropertyInput;
  currentOutput: PropertyOutput | null;

  // Saved properties (stored in localStorage for demo, would be in DB)
  properties: Property[];

  // Scenarios for comparison
  scenarios: Scenario[];

  // UI state
  selectedPropertyId: string | null;
  isCalculating: boolean;
  activeTab: string;

  // Family purchase state - stores previous values when toggling
  preFamilyPurchaseTaxPercent: number | null;
  preFamilyPurchaseBrokerPercent: number | null;

  // Actions
  updateInput: (updates: Partial<PropertyInput>) => void;
  resetInput: () => void;
  clearInput: () => void;
  calculate: () => void;

  // Property actions
  saveProperty: (name: string, address?: string) => void;
  loadProperty: (id: string) => void;
  deleteProperty: (id: string) => void;

  // Scenario actions
  addScenario: (name: string) => void;
  updateScenario: (id: string, updates: Partial<PropertyInput>) => void;
  removeScenario: (id: string) => void;
  clearScenarios: () => void;

  // UI actions
  setActiveTab: (tab: string) => void;

  // Portfolio
  getPortfolioSummary: () => PortfolioSummary;
}

export const useImmoCalcStore = create<ImmoCalcState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentInput: getDefaultPropertyInput(),
      currentOutput: null,
      properties: [],
      scenarios: [],
      selectedPropertyId: null,
      isCalculating: false,
      activeTab: "calculator",
      preFamilyPurchaseTaxPercent: null,
      preFamilyPurchaseBrokerPercent: null,

      // Update input and recalculate
      updateInput: (updates) => {
        set((state) => {
          let newInput = { ...state.currentInput, ...updates };
          let preFamilyPurchaseTaxPercent = state.preFamilyPurchaseTaxPercent;
          let preFamilyPurchaseBrokerPercent = state.preFamilyPurchaseBrokerPercent;

          // If family purchase is toggled ON, store current values and set tax and broker to 0
          if (updates.isFamilyPurchase === true) {
            preFamilyPurchaseTaxPercent = state.currentInput.propertyTransferTaxPercent;
            preFamilyPurchaseBrokerPercent = state.currentInput.brokerPercent;
            newInput = {
              ...newInput,
              propertyTransferTaxPercent: 0,
              brokerPercent: 0,
            };
          }

          // If family purchase is toggled OFF, restore previous values or defaults
          if (updates.isFamilyPurchase === false) {
            const defaultInput = getDefaultPropertyInput();
            newInput = {
              ...newInput,
              propertyTransferTaxPercent:
                preFamilyPurchaseTaxPercent ?? defaultInput.propertyTransferTaxPercent,
              brokerPercent: preFamilyPurchaseBrokerPercent ?? defaultInput.brokerPercent,
            };
            // Clear the stored values
            preFamilyPurchaseTaxPercent = null;
            preFamilyPurchaseBrokerPercent = null;
          }

          return {
            currentInput: newInput,
            currentOutput: calculatePropertyKPIs(newInput),
            preFamilyPurchaseTaxPercent,
            preFamilyPurchaseBrokerPercent,
          };
        });
      },

      // Reset to default values
      resetInput: () => {
        const defaultInput = getDefaultPropertyInput();
        set({
          currentInput: defaultInput,
          currentOutput: calculatePropertyKPIs(defaultInput),
          selectedPropertyId: null,
        });
      },

      // Clear input to zero/empty values with sensible defaults
      clearInput: () => {
        set({
          currentInput: {
            // Reset to zero/empty
            purchasePrice: 0,
            marketValue: undefined,
            renovationCosts: 0,
            equity: 0,
            loanAmount: 0,
            coldRentActual: 0,
            coldRentTarget: 0,
            nonRecoverableCosts: 0,
            maintenanceReserve: 0,
            isFamilyPurchase: false,

            // Keep sensible defaults (these are always needed)
            bundesland: "BAYERN",
            brokerPercent: 3.57,
            notaryPercent: 1.5,
            propertyTransferTaxPercent: 6.0, // Default to common rate
            interestRate: 3.5,
            repaymentRate: 2.0,
            fixedInterestPeriod: 10,
            vacancyRiskPercent: 2,
            personalTaxRate: 42,
            buildingSharePercent: 80,
            afaType: "ALTBAU_AB_1925" as AfAType,
            expectedAppreciationPercent: 2.0,
            expectedRentIncreasePercent: 1.5,
          },
        });
        get().calculate();
      },

      // Manual calculate
      calculate: () => {
        set((state) => ({
          isCalculating: true,
          currentOutput: calculatePropertyKPIs(state.currentInput),
        }));
        // Small delay to show loading state
        setTimeout(() => set({ isCalculating: false }), 100);
      },

      // Save current input as a property
      saveProperty: (name, address) => {
        const state = get();
        const output = calculatePropertyKPIs(state.currentInput);

        const newProperty: Property = {
          id: generateId(),
          name,
          address,
          createdAt: new Date(),
          updatedAt: new Date(),
          input: { ...state.currentInput },
          output,
        };

        set((state) => ({
          properties: [...state.properties, newProperty],
          selectedPropertyId: newProperty.id,
        }));
      },

      // Load a saved property
      loadProperty: (id) => {
        const property = get().properties.find((p) => p.id === id);
        if (property) {
          set({
            currentInput: { ...property.input },
            currentOutput: property.output || calculatePropertyKPIs(property.input),
            selectedPropertyId: id,
          });
        }
      },

      // Delete a property
      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          selectedPropertyId: state.selectedPropertyId === id ? null : state.selectedPropertyId,
        }));
      },

      // Add a new scenario for comparison
      addScenario: (name) => {
        const state = get();
        const output = calculatePropertyKPIs(state.currentInput);

        const newScenario: Scenario = {
          id: generateId(),
          name,
          input: { ...state.currentInput },
          output,
        };

        set((state) => ({
          scenarios: [...state.scenarios.slice(-2), newScenario], // Keep max 3 scenarios
        }));
      },

      // Update a scenario
      updateScenario: (id, updates) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id === id) {
              const newInput = { ...s.input, ...updates };
              return {
                ...s,
                input: newInput,
                output: calculatePropertyKPIs(newInput),
              };
            }
            return s;
          }),
        }));
      },

      // Remove a scenario
      removeScenario: (id) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
        }));
      },

      // Clear all scenarios
      clearScenarios: () => {
        set({ scenarios: [] });
      },

      // Set active tab
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      // Get portfolio summary
      getPortfolioSummary: () => {
        const properties = get().properties;

        if (properties.length === 0) {
          return {
            totalProperties: 0,
            totalInvestment: 0,
            totalEquity: 0,
            totalDebt: 0,
            totalMonthlyCashflow: 0,
            totalAnnualCashflow: 0,
            averageYield: 0,
          };
        }

        let totalInvestment = 0;
        let totalEquity = 0;
        let totalMonthlyCashflow = 0;
        let totalAnnualCashflow = 0;
        let yieldSum = 0;

        for (const property of properties) {
          const output = property.output || calculatePropertyKPIs(property.input);
          totalInvestment += output.investmentVolume.totalInvestment;
          totalEquity += property.input.equity;
          totalMonthlyCashflow += output.cashflow.monthlyCashflowAfterTax;
          totalAnnualCashflow += output.cashflow.cashflowAfterTax;
          yieldSum += output.yields.grossRentalYield;
        }

        return {
          totalProperties: properties.length,
          totalInvestment,
          totalEquity,
          totalDebt: totalInvestment - totalEquity,
          totalMonthlyCashflow,
          totalAnnualCashflow,
          averageYield: yieldSum / properties.length,
        };
      },
    }),
    {
      name: "immocalc-storage",
      partialize: (state) => ({
        properties: state.properties,
        currentInput: state.currentInput,
      }),
    }
  )
);
