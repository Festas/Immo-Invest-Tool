/**
 * Comprehensive unit tests for AI analysis service
 * Tests all functions in src/lib/ai/analysis.ts
 */

import { describe, it, expect } from "vitest";
import { analyzeDeal, generateInsights, answerInvestmentQuestion } from "@/lib/ai/analysis";
import type { DealAnalysis, DealScore, RiskFactor, AIInsight } from "@/lib/ai/analysis";
import { getDefaultPropertyInput, calculatePropertyKPIs } from "@/lib/calculations";
import type { PropertyInput, PropertyOutput, LocationAnalysisResult } from "@/types";

// Helper: create a standard property with calculated output
function createStandardProperty(): { input: PropertyInput; output: PropertyOutput } {
  const input = getDefaultPropertyInput();
  const output = calculatePropertyKPIs(input);
  return { input, output };
}

// Helper: create property with specific characteristics
function createPropertyWith(overrides: Partial<PropertyInput>): {
  input: PropertyInput;
  output: PropertyOutput;
} {
  const input = { ...getDefaultPropertyInput(), ...overrides };
  const output = calculatePropertyKPIs(input);
  return { input, output };
}

// ===========================================
// analyzeDeal Tests
// ===========================================
describe("analyzeDeal", () => {
  it("should return a complete DealAnalysis object", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);

    expect(analysis).toBeDefined();
    expect(analysis.score).toBeDefined();
    expect(analysis.risks).toBeDefined();
    expect(analysis.strengths).toBeDefined();
    expect(analysis.weaknesses).toBeDefined();
    expect(analysis.summary).toBeDefined();
    expect(analysis.detailedAnalysis).toBeDefined();
  });

  it("should produce a score between 0 and 100", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);

    expect(analysis.score.overall).toBeGreaterThanOrEqual(0);
    expect(analysis.score.overall).toBeLessThanOrEqual(100);
  });

  it("should produce category scores between 0 and 100", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);
    const { categories } = analysis.score;

    expect(categories.cashflow).toBeGreaterThanOrEqual(0);
    expect(categories.cashflow).toBeLessThanOrEqual(100);
    expect(categories.yield).toBeGreaterThanOrEqual(0);
    expect(categories.yield).toBeLessThanOrEqual(100);
    expect(categories.financing).toBeGreaterThanOrEqual(0);
    expect(categories.financing).toBeLessThanOrEqual(100);
    expect(categories.location).toBeGreaterThanOrEqual(0);
    expect(categories.location).toBeLessThanOrEqual(100);
    expect(categories.potential).toBeGreaterThanOrEqual(0);
    expect(categories.potential).toBeLessThanOrEqual(100);
  });

  it("should return valid rating values", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);

    expect(["EXCELLENT", "GOOD", "FAIR", "POOR"]).toContain(analysis.score.rating);
  });

  it("should return valid recommendation values", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);

    expect(["STRONG_BUY", "BUY", "HOLD", "AVOID"]).toContain(analysis.score.recommendation);
  });

  it("should rate a high-yield property favorably", () => {
    // High rent, low price, good equity
    const { input, output } = createPropertyWith({
      purchasePrice: 200000,
      equity: 80000,
      coldRentActual: 1200,
      coldRentTarget: 1400,
      interestRate: 2.5,
    });
    const analysis = analyzeDeal(input, output);

    expect(analysis.score.overall).toBeGreaterThanOrEqual(60);
    expect(["EXCELLENT", "GOOD"]).toContain(analysis.score.rating);
  });

  it("should rate a poor investment unfavorably", () => {
    // Very expensive, low rent, minimal equity, high interest
    const { input, output } = createPropertyWith({
      purchasePrice: 800000,
      equity: 40000,
      coldRentActual: 800,
      coldRentTarget: 800,
      interestRate: 5.5,
    });
    const analysis = analyzeDeal(input, output);

    expect(analysis.score.overall).toBeLessThan(60);
    expect(analysis.risks.length).toBeGreaterThan(0);
  });

  it("should include location data in analysis when provided", () => {
    const { input, output } = createStandardProperty();
    const locationData: LocationAnalysisResult = {
      overallScore: 85,
      locationQuality: "A",
      investmentRecommendation: "STARK_EMPFOHLEN",
      riskLevel: "NIEDRIG",
      strengths: ["Gute Infrastruktur", "Wachsende Bevölkerung"],
      weaknesses: [],
    };

    const analysis = analyzeDeal(input, output, locationData);

    // Location score should reflect provided data
    expect(analysis.score.categories.location).toBe(85);
  });

  it("should default location score to 50 when no location data provided", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);

    expect(analysis.score.categories.location).toBe(50);
  });

  // --- Risk identification tests ---

  it("should identify critical risk for very negative cashflow", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 800000,
      equity: 40000,
      coldRentActual: 500,
      interestRate: 5.0,
    });
    const analysis = analyzeDeal(input, output);
    const criticalCashflowRisks = analysis.risks.filter(
      (r) => r.type === "CRITICAL" && r.category === "Cashflow"
    );
    expect(criticalCashflowRisks.length).toBeGreaterThan(0);
  });

  it("should identify low equity risk when equity < 10%", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 500000,
      equity: 20000,
    });
    const analysis = analyzeDeal(input, output);
    const equityRisks = analysis.risks.filter((r) => r.category === "Finanzierung");
    expect(equityRisks.length).toBeGreaterThan(0);
  });

  it("should identify high interest rate risk", () => {
    const { input, output } = createPropertyWith({
      interestRate: 5.5,
    });
    const analysis = analyzeDeal(input, output);
    const interestRisks = analysis.risks.filter((r) => r.title.includes("Zinssatz"));
    expect(interestRisks.length).toBeGreaterThan(0);
  });

  it("should identify low yield risk when gross yield < 3.5%", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 500000,
      coldRentActual: 800,
    });
    const analysis = analyzeDeal(input, output);
    const yieldRisks = analysis.risks.filter(
      (r) => r.title.includes("Rendite") || r.title.includes("rendite")
    );
    expect(yieldRisks.length).toBeGreaterThan(0);
  });

  it("should flag location risks when location has high risk level", () => {
    const { input, output } = createStandardProperty();
    const locationData: LocationAnalysisResult = {
      overallScore: 25,
      locationQuality: "D",
      investmentRecommendation: "NICHT_EMPFOHLEN",
      riskLevel: "HOCH",
      strengths: [],
      weaknesses: ["Schrumpfende Bevölkerung", "Schwache Wirtschaft"],
    };

    const analysis = analyzeDeal(input, output, locationData);
    const locationRisks = analysis.risks.filter((r) => r.category === "Standort");
    expect(locationRisks.length).toBeGreaterThan(0);
  });

  // --- Strengths & Weaknesses ---

  it("should identify strengths for high-scoring categories", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 200000,
      equity: 80000,
      coldRentActual: 1200,
      coldRentTarget: 1400,
      interestRate: 2.5,
    });
    const analysis = analyzeDeal(input, output);
    expect(analysis.strengths.length).toBeGreaterThan(0);
  });

  it("should identify weaknesses for low-scoring categories", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 800000,
      equity: 40000,
      coldRentActual: 500,
      interestRate: 5.5,
    });
    const analysis = analyzeDeal(input, output);
    expect(analysis.weaknesses.length).toBeGreaterThan(0);
  });

  // --- Recommendation logic ---

  it("should recommend AVOID when multiple critical risks and low score", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 800000,
      equity: 20000,
      coldRentActual: 400,
      interestRate: 5.5,
    });
    const analysis = analyzeDeal(input, output);
    expect(analysis.score.recommendation).toBe("AVOID");
  });

  // --- Summary and detailed analysis ---

  it("should generate a non-empty summary", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);
    expect(analysis.summary.length).toBeGreaterThan(20);
    expect(analysis.summary).toContain("/100");
  });

  it("should generate a non-empty detailed analysis", () => {
    const { input, output } = createStandardProperty();
    const analysis = analyzeDeal(input, output);
    expect(analysis.detailedAnalysis.length).toBeGreaterThan(50);
    expect(analysis.detailedAnalysis).toContain("Cashflow");
    expect(analysis.detailedAnalysis).toContain("Rendite");
    expect(analysis.detailedAnalysis).toContain("Finanzierung");
  });
});

// ===========================================
// generateInsights Tests
// ===========================================
describe("generateInsights", () => {
  it("should return an array of insights", () => {
    const { input, output } = createStandardProperty();
    const insights = generateInsights(input, output);
    expect(Array.isArray(insights)).toBe(true);
  });

  it("should suggest cashflow optimization when cashflow is negative", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 500000,
      equity: 50000,
      coldRentActual: 600,
    });
    const insights = generateInsights(input, output);
    const cashflowInsight = insights.find((i) => i.title.includes("Cashflow"));
    expect(cashflowInsight).toBeDefined();
  });

  it("should suggest interest optimization when rate is high", () => {
    const { input, output } = createPropertyWith({
      interestRate: 4.5,
    });
    const insights = generateInsights(input, output);
    const interestInsight = insights.find((i) => i.title.includes("Zins"));
    expect(interestInsight).toBeDefined();
  });

  it("should suggest capital efficiency when equity ratio is high", () => {
    const { input, output } = createPropertyWith({
      purchasePrice: 200000,
      equity: 150000,
    });
    const insights = generateInsights(input, output);
    const efficiencyInsight = insights.find((i) => i.title.includes("Kapitaleffizienz"));
    expect(efficiencyInsight).toBeDefined();
  });

  it("should note tax advantage when tax effect is positive", () => {
    const { input, output } = createStandardProperty();
    // With standard input, there should be positive tax effects
    const insights = generateInsights(input, output);
    const taxInsight = insights.find((i) => i.title.includes("Steuer"));
    // This may or may not exist based on the specific calculation
    if (output.tax.taxEffect > 0) {
      expect(taxInsight).toBeDefined();
    }
  });

  it("each insight should have valid confidence level", () => {
    const { input, output } = createStandardProperty();
    const insights = generateInsights(input, output);
    for (const insight of insights) {
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(insight.confidence);
    }
  });
});

// ===========================================
// answerInvestmentQuestion Tests
// ===========================================
describe("answerInvestmentQuestion", () => {
  it("should answer cashflow-related questions", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("Wie ist der Cashflow?", { input, output });
    expect(answer).toContain("Cashflow");
    expect(answer.length).toBeGreaterThan(20);
  });

  it("should answer yield-related questions", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("Wie hoch ist die Rendite?", { input, output });
    expect(answer).toContain("rendite");
    expect(answer.length).toBeGreaterThan(20);
  });

  it("should answer financing-related questions", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("Wie ist die Finanzierung?", { input, output });
    expect(answer).toContain("Finanzierung");
    expect(answer.length).toBeGreaterThan(20);
  });

  it("should answer tax-related questions", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("Wie wirkt sich die AfA aus?", { input, output });
    expect(answer).toContain("AfA");
    expect(answer.length).toBeGreaterThan(20);
  });

  it("should handle English yield keyword", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("What is the yield?", { input, output });
    expect(answer).toContain("rendite");
  });

  it("should handle monatlich keyword", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("monatliche Kosten?", { input, output });
    expect(answer).toContain("Cashflow");
  });

  it("should return fallback for unrecognized questions", () => {
    const { input, output } = createStandardProperty();
    const answer = answerInvestmentQuestion("Was ist der Sinn des Lebens?", { input, output });
    expect(answer).toContain("mehr Kontext");
  });
});
