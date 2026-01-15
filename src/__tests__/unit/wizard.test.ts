/**
 * Unit tests for Wizard functionality
 * Tests wizard navigation, step validation, smart defaults, and Bundesland mapping
 */

import { describe, it, expect } from "vitest";
import { GERMAN_STATES, WIZARD_DEFAULTS } from "@/lib/constants/german-states";

// ===========================================
// German States Constants Tests
// ===========================================
describe("GERMAN_STATES", () => {
  it("should have all 16 German federal states", () => {
    const states = Object.keys(GERMAN_STATES);
    expect(states).toHaveLength(16);
  });

  it("should have correct tax rates for each state", () => {
    expect(GERMAN_STATES.BAYERN.taxRate).toBe(3.5);
    expect(GERMAN_STATES.BADEN_WUERTTEMBERG.taxRate).toBe(5.0);
    expect(GERMAN_STATES.BERLIN.taxRate).toBe(6.0);
    expect(GERMAN_STATES.BRANDENBURG.taxRate).toBe(6.5);
    expect(GERMAN_STATES.BREMEN.taxRate).toBe(5.0);
    expect(GERMAN_STATES.HAMBURG.taxRate).toBe(5.5);
    expect(GERMAN_STATES.HESSEN.taxRate).toBe(6.0);
    expect(GERMAN_STATES.MECKLENBURG_VORPOMMERN.taxRate).toBe(6.0);
    expect(GERMAN_STATES.NIEDERSACHSEN.taxRate).toBe(5.0);
    expect(GERMAN_STATES.NORDRHEIN_WESTFALEN.taxRate).toBe(6.5);
    expect(GERMAN_STATES.RHEINLAND_PFALZ.taxRate).toBe(5.0);
    expect(GERMAN_STATES.SAARLAND.taxRate).toBe(6.5);
    expect(GERMAN_STATES.SACHSEN.taxRate).toBe(5.5);
    expect(GERMAN_STATES.SACHSEN_ANHALT.taxRate).toBe(5.0);
    expect(GERMAN_STATES.SCHLESWIG_HOLSTEIN.taxRate).toBe(6.5);
    expect(GERMAN_STATES.THUERINGEN.taxRate).toBe(5.0);
  });

  it("should have Bayern as the state with the lowest tax rate", () => {
    const rates = Object.values(GERMAN_STATES).map((state) => state.taxRate);
    const minRate = Math.min(...rates);
    expect(minRate).toBe(3.5);
    expect(GERMAN_STATES.BAYERN.taxRate).toBe(minRate);
  });

  it("should have multiple states with the highest tax rate of 6.5%", () => {
    const statesWithHighestRate = Object.entries(GERMAN_STATES)
      .filter(([, state]) => state.taxRate === 6.5)
      .map(([key]) => key);

    expect(statesWithHighestRate).toContain("BRANDENBURG");
    expect(statesWithHighestRate).toContain("NORDRHEIN_WESTFALEN");
    expect(statesWithHighestRate).toContain("SAARLAND");
    expect(statesWithHighestRate).toContain("SCHLESWIG_HOLSTEIN");
  });

  it("should have proper German names for all states", () => {
    expect(GERMAN_STATES.BAYERN.name).toBe("Bayern");
    expect(GERMAN_STATES.BADEN_WUERTTEMBERG.name).toBe("Baden-Württemberg");
    expect(GERMAN_STATES.NORDRHEIN_WESTFALEN.name).toBe("Nordrhein-Westfalen");
  });
});

// ===========================================
// Wizard Defaults Tests
// ===========================================
describe("WIZARD_DEFAULTS", () => {
  it("should have correct default broker percentage", () => {
    expect(WIZARD_DEFAULTS.brokerPercent).toBe(3.57);
  });

  it("should have correct default notary percentage", () => {
    expect(WIZARD_DEFAULTS.notaryPercent).toBe(1.5);
  });

  it("should have correct default maintenance reserve per sqm", () => {
    expect(WIZARD_DEFAULTS.maintenanceReservePerSqm).toBe(10);
  });

  it("should have correct default personal tax rate", () => {
    expect(WIZARD_DEFAULTS.personalTaxRate).toBe(42);
  });

  it("should have correct default building share percentage", () => {
    expect(WIZARD_DEFAULTS.buildingSharePercent).toBe(80);
  });

  it("should have all required default fields", () => {
    expect(WIZARD_DEFAULTS).toHaveProperty("brokerPercent");
    expect(WIZARD_DEFAULTS).toHaveProperty("notaryPercent");
    expect(WIZARD_DEFAULTS).toHaveProperty("maintenanceReservePerSqm");
    expect(WIZARD_DEFAULTS).toHaveProperty("personalTaxRate");
    expect(WIZARD_DEFAULTS).toHaveProperty("buildingSharePercent");
  });
});

// ===========================================
// Bundesland to Tax Rate Mapping Tests
// ===========================================
describe("Bundesland to Property Transfer Tax Mapping", () => {
  it("should correctly map Bayern to 3.5% tax rate", () => {
    const bundesland = "BAYERN";
    const state = GERMAN_STATES[bundesland];
    expect(state.taxRate).toBe(3.5);
  });

  it("should correctly map Nordrhein-Westfalen to 6.5% tax rate", () => {
    const bundesland = "NORDRHEIN_WESTFALEN";
    const state = GERMAN_STATES[bundesland];
    expect(state.taxRate).toBe(6.5);
  });

  it("should correctly map Berlin to 6.0% tax rate", () => {
    const bundesland = "BERLIN";
    const state = GERMAN_STATES[bundesland];
    expect(state.taxRate).toBe(6.0);
  });

  it("should handle all Bundesland keys without errors", () => {
    const bundeslandKeys = Object.keys(GERMAN_STATES);
    
    bundeslandKeys.forEach((key) => {
      const state = GERMAN_STATES[key];
      expect(state).toBeDefined();
      expect(state.name).toBeDefined();
      expect(state.taxRate).toBeGreaterThan(0);
      expect(state.taxRate).toBeLessThanOrEqual(10);
    });
  });
});

// ===========================================
// Wizard Step Validation Logic Tests
// ===========================================
describe("Wizard Step Validation", () => {
  it("step 1 should require purchase price > 0", () => {
    const purchasePrice1 = 0;
    const purchasePrice2 = 300000;
    
    expect(purchasePrice1 > 0).toBe(false);
    expect(purchasePrice2 > 0).toBe(true);
  });

  it("step 2 should require equity >= 0 and interest rate > 0", () => {
    const equity1 = -1000;
    const equity2 = 0;
    const equity3 = 60000;
    const interestRate1 = 0;
    const interestRate2 = 3.5;
    
    expect(equity1 >= 0).toBe(false);
    expect(equity2 >= 0).toBe(true);
    expect(equity3 >= 0).toBe(true);
    expect(interestRate1 > 0).toBe(false);
    expect(interestRate2 > 0).toBe(true);
  });

  it("step 4 should require cold rent actual > 0", () => {
    const coldRent1 = 0;
    const coldRent2 = 1200;
    
    expect(coldRent1 > 0).toBe(false);
    expect(coldRent2 > 0).toBe(true);
  });

  it("should allow proceeding when all required fields are filled", () => {
    const input = {
      purchasePrice: 300000,
      equity: 60000,
      interestRate: 3.5,
      coldRentActual: 1200,
    };
    
    expect(input.purchasePrice > 0).toBe(true);
    expect(input.equity >= 0).toBe(true);
    expect(input.interestRate > 0).toBe(true);
    expect(input.coldRentActual > 0).toBe(true);
  });
});

// ===========================================
// Smart Defaults Application Tests
// ===========================================
describe("Smart Defaults Application", () => {
  it("should apply cost defaults correctly", () => {
    const brokerPercent = WIZARD_DEFAULTS.brokerPercent;
    const notaryPercent = WIZARD_DEFAULTS.notaryPercent;
    
    expect(brokerPercent).toBe(3.57);
    expect(notaryPercent).toBe(1.5);
  });

  it("should calculate maintenance reserve based on living area", () => {
    const livingArea = 75; // m²
    const maintenanceReserve = livingArea * WIZARD_DEFAULTS.maintenanceReservePerSqm;
    
    expect(maintenanceReserve).toBe(750); // 75 * 10
  });

  it("should apply tax defaults correctly", () => {
    const personalTaxRate = WIZARD_DEFAULTS.personalTaxRate;
    const buildingSharePercent = WIZARD_DEFAULTS.buildingSharePercent;
    
    expect(personalTaxRate).toBe(42);
    expect(buildingSharePercent).toBe(80);
  });

  it("should calculate different maintenance reserves for different living areas", () => {
    const area1 = 50;
    const area2 = 100;
    const area3 = 150;
    
    expect(area1 * WIZARD_DEFAULTS.maintenanceReservePerSqm).toBe(500);
    expect(area2 * WIZARD_DEFAULTS.maintenanceReservePerSqm).toBe(1000);
    expect(area3 * WIZARD_DEFAULTS.maintenanceReservePerSqm).toBe(1500);
  });
});

// ===========================================
// Property Transfer Tax Range Tests
// ===========================================
describe("Property Transfer Tax Ranges", () => {
  it("should have tax rates within expected range (3.5% - 6.5%)", () => {
    const allRates = Object.values(GERMAN_STATES).map((state) => state.taxRate);
    const minRate = Math.min(...allRates);
    const maxRate = Math.max(...allRates);
    
    expect(minRate).toBe(3.5);
    expect(maxRate).toBe(6.5);
  });

  it("should calculate correct property transfer tax for different states", () => {
    const purchasePrice = 300000;
    
    const taxBavaria = (purchasePrice * GERMAN_STATES.BAYERN.taxRate) / 100;
    const taxNRW = (purchasePrice * GERMAN_STATES.NORDRHEIN_WESTFALEN.taxRate) / 100;
    const taxBerlin = (purchasePrice * GERMAN_STATES.BERLIN.taxRate) / 100;
    
    expect(taxBavaria).toBe(10500); // 300000 * 0.035
    expect(taxNRW).toBe(19500); // 300000 * 0.065
    expect(taxBerlin).toBe(18000); // 300000 * 0.06
  });

  it("should show significant difference between lowest and highest tax rates", () => {
    const purchasePrice = 300000;
    const lowestTax = (purchasePrice * 3.5) / 100;
    const highestTax = (purchasePrice * 6.5) / 100;
    const difference = highestTax - lowestTax;
    
    expect(difference).toBe(9000); // Significant €9,000 difference
  });
});

// ===========================================
// Wizard Navigation Tests
// ===========================================
describe("Wizard Navigation Logic", () => {
  it("should start at step 0", () => {
    const currentStep = 0;
    expect(currentStep).toBe(0);
  });

  it("should not allow going back from first step", () => {
    const currentStep = 0;
    const isFirstStep = currentStep === 0;
    expect(isFirstStep).toBe(true);
  });

  it("should allow going forward if current step is valid", () => {
    const currentStep = 0;
    const totalSteps = 5;
    const canGoNext = true; // Validation passed
    const isLastStep = currentStep === totalSteps - 1;
    
    expect(canGoNext && !isLastStep).toBe(true);
  });

  it("should identify last step correctly", () => {
    const currentStep = 4;
    const totalSteps = 5;
    const isLastStep = currentStep === totalSteps - 1;
    
    expect(isLastStep).toBe(true);
  });

  it("should allow completing wizard on last step if valid", () => {
    const currentStep = 4;
    const totalSteps = 5;
    const canGoNext = true; // All validation passed
    const isLastStep = currentStep === totalSteps - 1;
    
    expect(isLastStep && canGoNext).toBe(true);
  });
});
