/**
 * Comprehensive unit tests for Monte Carlo simulation
 * Tests all functions in src/lib/analytics/monte-carlo.ts
 */

import { describe, it, expect } from "vitest";
import {
  runMonteCarloSimulation,
  calculateRiskMetrics,
  generateHistogramData,
  runSensitivityAnalysis,
  quickMonteCarloSimulation,
} from "@/lib/analytics/monte-carlo";
import type { MonteCarloInput, SimulationResult, RiskMetrics } from "@/lib/analytics/monte-carlo";

// Helper: create standard Monte Carlo input
function createStandardInput(): MonteCarloInput {
  return {
    initialInvestment: 300000,
    annualCashflow: 5000,
    cashflowVariability: 10,
    annualAppreciation: 2.0,
    appreciationVariability: 5,
    yearsToSimulate: 10,
    numberOfSimulations: 500, // Lower for test speed
  };
}

// ===========================================
// runMonteCarloSimulation Tests
// ===========================================
describe("runMonteCarloSimulation", () => {
  it("should return a valid SimulationResult", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result).toBeDefined();
    expect(result.finalValues).toBeDefined();
    expect(result.percentiles).toBeDefined();
    expect(result.mean).toBeDefined();
    expect(result.standardDeviation).toBeDefined();
    expect(result.probabilityOfLoss).toBeDefined();
    expect(result.probabilityOfDoubling).toBeDefined();
    expect(result.yearlyProjections).toBeDefined();
  });

  it("should produce correct number of final values", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.finalValues.length).toBe(input.numberOfSimulations);
  });

  it("should produce sorted final values", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    for (let i = 1; i < result.finalValues.length; i++) {
      expect(result.finalValues[i]).toBeGreaterThanOrEqual(result.finalValues[i - 1]);
    }
  });

  it("should produce yearly projections for all years plus year 0", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.yearlyProjections.length).toBe(input.yearsToSimulate + 1);
    expect(result.yearlyProjections[0].year).toBe(0);
    expect(result.yearlyProjections[input.yearsToSimulate].year).toBe(input.yearsToSimulate);
  });

  it("should have year 0 projection equal to initial investment", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.yearlyProjections[0].mean).toBe(input.initialInvestment);
  });

  it("should produce percentiles in ascending order", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const { p5, p10, p25, p50, p75, p90, p95 } = result.percentiles;

    expect(p5).toBeLessThanOrEqual(p10);
    expect(p10).toBeLessThanOrEqual(p25);
    expect(p25).toBeLessThanOrEqual(p50);
    expect(p50).toBeLessThanOrEqual(p75);
    expect(p75).toBeLessThanOrEqual(p90);
    expect(p90).toBeLessThanOrEqual(p95);
  });

  it("should have probability of loss between 0 and 100", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.probabilityOfLoss).toBeGreaterThanOrEqual(0);
    expect(result.probabilityOfLoss).toBeLessThanOrEqual(100);
  });

  it("should have probability of doubling between 0 and 100", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.probabilityOfDoubling).toBeGreaterThanOrEqual(0);
    expect(result.probabilityOfDoubling).toBeLessThanOrEqual(100);
  });

  it("should produce positive standard deviation for variable inputs", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    expect(result.standardDeviation).toBeGreaterThan(0);
  });

  it("should produce reasonable mean for positive appreciation", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    // With 2% appreciation and positive cashflow over 10 years,
    // mean should be higher than initial investment
    expect(result.mean).toBeGreaterThan(input.initialInvestment);
  });

  it("should handle zero variability (deterministic case)", () => {
    const input: MonteCarloInput = {
      initialInvestment: 300000,
      annualCashflow: 5000,
      cashflowVariability: 0,
      annualAppreciation: 2.0,
      appreciationVariability: 0,
      yearsToSimulate: 10,
      numberOfSimulations: 100,
    };
    const result = runMonteCarloSimulation(input);

    // With zero variability, all simulations should give similar results
    // (some floating point variance expected due to random normal)
    const range = result.percentiles.p95 - result.percentiles.p5;
    const mean = result.mean;
    // Range should be very small relative to mean
    expect(range / mean).toBeLessThan(0.01);
  });

  it("should handle negative cashflow", () => {
    const input: MonteCarloInput = {
      initialInvestment: 300000,
      annualCashflow: -3000,
      cashflowVariability: 10,
      annualAppreciation: 1.0,
      appreciationVariability: 3,
      yearsToSimulate: 10,
      numberOfSimulations: 200,
    };
    const result = runMonteCarloSimulation(input);

    expect(result).toBeDefined();
    expect(result.finalValues.length).toBe(200);
  });

  it("should handle single year simulation", () => {
    const input: MonteCarloInput = {
      ...createStandardInput(),
      yearsToSimulate: 1,
    };
    const result = runMonteCarloSimulation(input);

    expect(result.yearlyProjections.length).toBe(2); // year 0 + year 1
  });

  it("yearly projection percentiles should be ordered correctly", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    for (const proj of result.yearlyProjections) {
      expect(proj.min).toBeLessThanOrEqual(proj.p10);
      expect(proj.p10).toBeLessThanOrEqual(proj.p25);
      expect(proj.p25).toBeLessThanOrEqual(proj.p50);
      expect(proj.p50).toBeLessThanOrEqual(proj.p75);
      expect(proj.p75).toBeLessThanOrEqual(proj.p90);
      expect(proj.p90).toBeLessThanOrEqual(proj.max);
    }
  });
});

// ===========================================
// calculateRiskMetrics Tests
// ===========================================
describe("calculateRiskMetrics", () => {
  it("should return valid risk metrics", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const metrics = calculateRiskMetrics(result, input.initialInvestment);

    expect(metrics).toBeDefined();
    expect(metrics.valueAtRisk95).toBeDefined();
    expect(metrics.expectedShortfall).toBeDefined();
    expect(metrics.sharpeRatio).toBeDefined();
    expect(metrics.sortinoRatio).toBeDefined();
    expect(metrics.maxDrawdown).toBeDefined();
  });

  it("VaR should be positive when there is risk of loss", () => {
    const input: MonteCarloInput = {
      initialInvestment: 300000,
      annualCashflow: -5000,
      cashflowVariability: 20,
      annualAppreciation: 0,
      appreciationVariability: 10,
      yearsToSimulate: 10,
      numberOfSimulations: 500,
    };
    const result = runMonteCarloSimulation(input);
    const metrics = calculateRiskMetrics(result, input.initialInvestment);

    // With negative cashflow and no appreciation, VaR should be positive
    expect(metrics.valueAtRisk95).toBeGreaterThan(0);
  });

  it("expected shortfall should be >= VaR", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const metrics = calculateRiskMetrics(result, input.initialInvestment);

    expect(metrics.expectedShortfall).toBeGreaterThanOrEqual(metrics.valueAtRisk95);
  });

  it("max drawdown should be non-negative", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const metrics = calculateRiskMetrics(result, input.initialInvestment);

    expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0);
  });

  it("should use custom risk-free rate", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    const metrics1 = calculateRiskMetrics(result, input.initialInvestment, 1.0);
    const metrics2 = calculateRiskMetrics(result, input.initialInvestment, 5.0);

    // Higher risk-free rate should lower Sharpe ratio
    expect(metrics2.sharpeRatio).toBeLessThan(metrics1.sharpeRatio);
  });
});

// ===========================================
// generateHistogramData Tests
// ===========================================
describe("generateHistogramData", () => {
  it("should return correct number of bins", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const histogram = generateHistogramData(result.finalValues, 20);

    expect(histogram.length).toBe(20);
  });

  it("should have total count equal to number of simulations", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const histogram = generateHistogramData(result.finalValues);

    const totalCount = histogram.reduce((sum, bin) => sum + bin.count, 0);
    expect(totalCount).toBe(input.numberOfSimulations);
  });

  it("should have percentages summing to approximately 100", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const histogram = generateHistogramData(result.finalValues);

    const totalPercent = histogram.reduce((sum, bin) => sum + bin.percentage, 0);
    expect(totalPercent).toBeCloseTo(100, 0);
  });

  it("should have non-negative counts and percentages", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const histogram = generateHistogramData(result.finalValues);

    for (const bin of histogram) {
      expect(bin.count).toBeGreaterThanOrEqual(0);
      expect(bin.percentage).toBeGreaterThanOrEqual(0);
    }
  });

  it("each bin should have a range string", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);
    const histogram = generateHistogramData(result.finalValues);

    for (const bin of histogram) {
      expect(bin.range).toBeDefined();
      expect(bin.range.includes(" - ")).toBe(true);
    }
  });

  it("should handle custom bin count", () => {
    const input = createStandardInput();
    const result = runMonteCarloSimulation(input);

    const histogram10 = generateHistogramData(result.finalValues, 10);
    const histogram50 = generateHistogramData(result.finalValues, 50);

    expect(histogram10.length).toBe(10);
    expect(histogram50.length).toBe(50);
  });
});

// ===========================================
// runSensitivityAnalysis Tests
// ===========================================
describe("runSensitivityAnalysis", () => {
  it("should return results for each variation", () => {
    const baseInput = createStandardInput();
    const variations = [1.0, 2.0, 3.0, 4.0, 5.0];
    const results = runSensitivityAnalysis(baseInput, "annualAppreciation", variations, 100);

    expect(results.length).toBe(variations.length);
  });

  it("each result should have value, mean, p10, p90", () => {
    const baseInput = createStandardInput();
    const variations = [1.0, 3.0];
    const results = runSensitivityAnalysis(baseInput, "annualAppreciation", variations, 100);

    for (const result of results) {
      expect(result.value).toBeDefined();
      expect(result.mean).toBeDefined();
      expect(result.p10).toBeDefined();
      expect(result.p90).toBeDefined();
    }
  });

  it("higher appreciation should lead to higher mean values", () => {
    const baseInput = createStandardInput();
    const variations = [0.5, 5.0];
    const results = runSensitivityAnalysis(baseInput, "annualAppreciation", variations, 200);

    expect(results[1].mean).toBeGreaterThan(results[0].mean);
  });

  it("p10 should be less than or equal to p90", () => {
    const baseInput = createStandardInput();
    const variations = [2.0];
    const results = runSensitivityAnalysis(baseInput, "annualAppreciation", variations, 100);

    expect(results[0].p10).toBeLessThanOrEqual(results[0].p90);
  });
});

// ===========================================
// quickMonteCarloSimulation Tests
// ===========================================
describe("quickMonteCarloSimulation", () => {
  it("should run with minimal parameters", () => {
    const result = quickMonteCarloSimulation(300000, 5000);

    expect(result).toBeDefined();
    expect(result.finalValues.length).toBe(1000);
    expect(result.yearlyProjections.length).toBe(11); // 0-10 years
  });

  it("should use default 10 years", () => {
    const result = quickMonteCarloSimulation(300000, 5000);
    expect(result.yearlyProjections.length).toBe(11);
  });

  it("should accept custom years", () => {
    const result = quickMonteCarloSimulation(300000, 5000, 20);
    expect(result.yearlyProjections.length).toBe(21);
  });

  it("should handle zero cashflow", () => {
    const result = quickMonteCarloSimulation(300000, 0);
    expect(result).toBeDefined();
    expect(result.finalValues.length).toBe(1000);
  });
});
