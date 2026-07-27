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
 * Generate a UUID using the crypto API.
 * crypto.randomUUID() is available in all modern browsers, Node.js 19+,
 * and all environments where this application runs.
 */
function generateId(): string {
  return crypto.randomUUID();
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
  wizardMode: boolean;

  // Navigation state
  sidebarCollapsed: boolean;
  recentTabs: string[];
  currentCategory: string | null;

  // Family purchase state - stores previous values when toggling
  preFamilyPurchaseTaxPercent: number | null;
  preFamilyPurchaseBrokerPercent: number | null;

  // Actions
  updateInput: (updates: Partial<PropertyInput>) => void;
  resetInput: () => void;
  clearInput: () => void;
  loadInput: (input: PropertyInput) => void;
  calculate: () => void;
  loadSampleProperty: () => void;

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
  setWizardMode: (enabled: boolean) => void;

  // Navigation actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addRecentTab: (tab: string) => void;
  setCurrentCategory: (category: string | null) => void;

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
      wizardMode: true,
      preFamilyPurchaseTaxPercent: null,
      preFamilyPurchaseBrokerPercent: null,

      // Navigation state
      sidebarCollapsed: false,
      recentTabs: [],
      currentCategory: null,

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

      // Load a complete input (e.g. from a shared URL) and recalculate
      loadInput: (input) => {
        set({
          currentInput: input,
          currentOutput: calculatePropertyKPIs(input),
          selectedPropertyId: null,
        });
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

      // Load a realistic sample property for demo purposes
      loadSampleProperty: () => {
        set({
          currentInput: {
            purchasePrice: 285000,
            brokerPercent: 3.57,
            notaryPercent: 2.0,
            propertyTransferTaxPercent: 3.5,
            renovationCosts: 15000,
            isFamilyPurchase: false,
            marketValue: undefined,
            bundesland: "BAYERN",
            equity: 75000,
            loanAmount: 0,
            interestRate: 3.8,
            repaymentRate: 2.5,
            fixedInterestPeriod: 15,
            coldRentActual: 950,
            coldRentTarget: 1050,
            nonRecoverableCosts: 120,
            maintenanceReserve: 80,
            vacancyRiskPercent: 3.0,
            personalTaxRate: 35.0,
            buildingSharePercent: 75.0,
            afaType: "ALTBAU_AB_1925" as AfAType,
            movableAssetsValue: 5000,
            movableAssetsDepreciationYears: 10,
            expectedAppreciationPercent: 2.0,
            expectedRentIncreasePercent: 1.5,
          },
          wizardMode: false, // Switch to expert mode to show results
        });
        get().calculate();
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

        // Update local state (persisted in localStorage)
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
        // Update local state (persisted in localStorage)
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
        get().addRecentTab(tab);
      },

      // Set wizard mode
      setWizardMode: (enabled) => {
        set({ wizardMode: enabled });
      },

      // Toggle sidebar collapsed state
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Add a tab to recent tabs list (max 5)
      addRecentTab: (tab) => {
        set((state) => {
          const filtered = state.recentTabs.filter((t) => t !== tab);
          return {
            recentTabs: [tab, ...filtered].slice(0, 5),
          };
        });
      },

      // Set current category
      setCurrentCategory: (category) => {
        set({ currentCategory: category });
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
        wizardMode: state.wizardMode,
        sidebarCollapsed: state.sidebarCollapsed,
        recentTabs: state.recentTabs,
      }),
    }
  )
);
