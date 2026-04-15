/**
 * ImmoCalc Pro - Feature Calculation Module
 *
 * Specialized calculators: Rent Index, Break-Even, Renovation ROI,
 * Exit Strategy, and Location Analysis.
 */

import {
  RentIndexInput,
  RentIndexResult,
  ReferenceRentData,
  BreakEvenInput,
  BreakEvenResult,
  RenovationInput,
  RenovationResult,
  ExitStrategyInput,
  ExitStrategyResult,
  LocationAnalysisInput,
  LocationAnalysisResult,
  LocationQuality,
} from "@/types";

// Reusable currency formatter for German locale
const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Calculate rent index comparison (Mietpreisspiegel)
 */
export function calculateRentIndex(input: RentIndexInput): RentIndexResult {
  const regionData = ReferenceRentData[input.city] || ReferenceRentData.SONSTIGE;
  const currentRentPerSqm = input.livingArea > 0 ? input.currentRent / input.livingArea : 0;

  // Base market rent
  let marketRentPerSqm = regionData.avgRentPerSqm;

  // Adjustments based on property characteristics
  // Year built adjustment
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.yearBuilt;
  if (age < 5)
    marketRentPerSqm *= 1.15; // New build premium
  else if (age < 20) marketRentPerSqm *= 1.05;
  else if (age > 50) marketRentPerSqm *= 0.92;
  else if (age > 80) marketRentPerSqm *= 0.85;

  // Condition adjustment
  switch (input.condition) {
    case "SEHR_GUT":
      marketRentPerSqm *= 1.1;
      break;
    case "GUT":
      marketRentPerSqm *= 1.0;
      break;
    case "MITTEL":
      marketRentPerSqm *= 0.92;
      break;
    case "RENOVIERUNGSBEDUERFTIG":
      marketRentPerSqm *= 0.8;
      break;
  }

  // Equipment adjustment
  switch (input.equipment) {
    case "GEHOBEN":
      marketRentPerSqm *= 1.12;
      break;
    case "STANDARD":
      marketRentPerSqm *= 1.0;
      break;
    case "EINFACH":
      marketRentPerSqm *= 0.9;
      break;
  }

  // Additional features
  if (input.hasBalcony) marketRentPerSqm *= 1.03;
  if (input.hasElevator && input.floor > 2) marketRentPerSqm *= 1.02;
  if (input.floor === 0) marketRentPerSqm *= 0.97; // Ground floor discount
  if (input.floor > 4 && !input.hasElevator) marketRentPerSqm *= 0.95;

  const adjustedMarketRent = marketRentPerSqm * input.livingArea;
  const rentPotential =
    currentRentPerSqm > 0 ? ((marketRentPerSqm - currentRentPerSqm) / currentRentPerSqm) * 100 : 0;

  let recommendation: string;
  if (rentPotential > 15) {
    recommendation =
      "🟢 Erhebliches Mieterhöhungspotenzial vorhanden. Eine Mietanpassung sollte geprüft werden.";
  } else if (rentPotential > 5) {
    recommendation =
      "🟡 Moderates Mieterhöhungspotenzial. Eine schrittweise Anpassung ist möglich.";
  } else if (rentPotential > -5) {
    recommendation = "🟠 Die Miete entspricht etwa dem Marktniveau.";
  } else {
    recommendation =
      "🔴 Die aktuelle Miete liegt über dem Marktniveau. Vorsicht bei Neuvermietungen.";
  }

  return {
    currentRentPerSqm,
    marketRentPerSqm,
    marketRentRange: { min: regionData.minRent, max: regionData.maxRent },
    adjustedMarketRent,
    rentPotential,
    recommendation,
  };
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const {
    totalInvestment,
    equity,
    annualCashflow,
    annualAppreciation,
    sellingCostsPercent,
    marketValue,
    amortizationSchedule,
  } = input;

  // Use marketValue as starting point if provided, otherwise use totalInvestment
  const startValue = marketValue && marketValue > 0 ? marketValue : totalInvestment;

  // Break-even through cashflow only
  const breakEvenYearsCashflow =
    annualCashflow > 0 ? Math.ceil(totalInvestment / annualCashflow) : 999;

  // Break-even including appreciation
  let breakEvenYearsTotal = 999;
  let cumulativeReturn = 0;
  let propertyValue = startValue;

  for (let year = 1; year <= 50; year++) {
    cumulativeReturn += annualCashflow;
    propertyValue *= 1 + annualAppreciation / 100;
    const appreciation = propertyValue - startValue;
    const netAppreciation = appreciation * (1 - sellingCostsPercent / 100);

    if (cumulativeReturn + netAppreciation >= totalInvestment && breakEvenYearsTotal === 999) {
      breakEvenYearsTotal = year;
      break;
    }
  }

  // Calculate returns at specific time points
  const calculateReturnAtYear = (years: number) => {
    const cashflowTotal = annualCashflow * years;
    const futureValue = startValue * Math.pow(1 + annualAppreciation / 100, years);
    const appreciation = futureValue - startValue;
    const netAppreciation = appreciation * (1 - sellingCostsPercent / 100);

    // Calculate remaining debt if amortization schedule is provided
    const remainingDebt =
      amortizationSchedule && years <= amortizationSchedule.length
        ? amortizationSchedule[years - 1]?.endingBalance || 0
        : 0;

    const netProceeds = futureValue * (1 - sellingCostsPercent / 100) - remainingDebt;

    return {
      totalReturn: cashflowTotal + netAppreciation,
      netProceeds: netProceeds + cashflowTotal,
    };
  };

  const returnAt5Years = calculateReturnAtYear(5);
  const returnAt10Years = calculateReturnAtYear(10);
  const returnAt15Years = calculateReturnAtYear(15);

  // ROI based on equity, not total investment
  const roiAt5Years = equity > 0 ? (returnAt5Years.totalReturn / equity) * 100 : 0;
  const roiAt10Years = equity > 0 ? (returnAt10Years.totalReturn / equity) * 100 : 0;
  const roiAt15Years = equity > 0 ? (returnAt15Years.totalReturn / equity) * 100 : 0;

  // Equity Multiplier: How many times the equity has grown
  const equityMultiplierAt10Years =
    equity > 0 ? (equity + returnAt10Years.totalReturn) / equity : 0;
  const equityMultiplierAt15Years =
    equity > 0 ? (equity + returnAt15Years.totalReturn) / equity : 0;

  return {
    breakEvenYearsCashflow,
    breakEvenYearsTotal,
    totalReturnAt5Years: returnAt5Years.totalReturn,
    totalReturnAt10Years: returnAt10Years.totalReturn,
    totalReturnAt15Years: returnAt15Years.totalReturn,
    roiAt5Years,
    roiAt10Years,
    roiAt15Years,
    netProceedsAt5Years: returnAt5Years.netProceeds,
    netProceedsAt10Years: returnAt10Years.netProceeds,
    netProceedsAt15Years: returnAt15Years.netProceeds,
    equityMultiplierAt10Years,
    equityMultiplierAt15Years,
  };
}

/**
 * Calculate renovation ROI
 */
export function calculateRenovationROI(input: RenovationInput): RenovationResult {
  const {
    estimatedCost,
    expectedRentIncrease,
    expectedValueIncrease,
    financingPercent,
    interestRate,
  } = input;

  const annualRentIncrease = expectedRentIncrease * 12;

  // Calculate financing costs if applicable
  const financed = estimatedCost * (financingPercent / 100);
  const annualInterestCost = financed * (interestRate / 100);
  const netAnnualBenefit = annualRentIncrease - annualInterestCost;

  // Payback period
  const paybackPeriodYears = netAnnualBenefit > 0 ? estimatedCost / netAnnualBenefit : 999;

  // ROI from rent increase
  const roiPercent = estimatedCost > 0 ? (netAnnualBenefit / estimatedCost) * 100 : 0;

  // ROI from value increase
  const valueIncreaseRoi = estimatedCost > 0 ? (expectedValueIncrease / estimatedCost) * 100 : 0;

  // Combined assessment
  const isRecommended = paybackPeriodYears <= 10 || valueIncreaseRoi >= 100;

  let recommendation: string;
  if (paybackPeriodYears <= 5 && valueIncreaseRoi >= 100) {
    recommendation = "🟢 Sehr empfehlenswert! Schnelle Amortisation und gute Wertsteigerung.";
  } else if (paybackPeriodYears <= 8 || valueIncreaseRoi >= 80) {
    recommendation = "🟡 Empfehlenswert. Solide Investition mit gutem Potenzial.";
  } else if (paybackPeriodYears <= 12 || valueIncreaseRoi >= 50) {
    recommendation = "🟠 Bedingt empfehlenswert. Langfristige Investition.";
  } else {
    recommendation = "🔴 Nicht empfohlen. Kosten übersteigen den erwarteten Nutzen.";
  }

  return {
    totalCost: estimatedCost,
    annualRentIncrease,
    paybackPeriodYears,
    roiPercent,
    valueIncreaseRoi,
    isRecommended,
    recommendation,
  };
}

/**
 * Calculate exit strategy / selling analysis
 */
export function calculateExitStrategy(input: ExitStrategyInput): ExitStrategyResult {
  const {
    purchasePrice,
    currentValue,
    marketValue,
    holdingPeriodYears,
    remainingDebt,
    cumulativeCashflow,
    speculationTaxApplies,
    personalTaxRate,
    equity,
    totalTilgung,
  } = input;

  // Use marketValue as base if provided, otherwise use purchasePrice
  const baseValue = marketValue && marketValue > 0 ? marketValue : purchasePrice;
  const grossProfit = currentValue - baseValue;

  // Default selling costs percentage (typically 5-8% including broker, notary, etc.)
  const DEFAULT_SELLING_COSTS_PERCENT = 6;
  const sellingCosts = currentValue * (DEFAULT_SELLING_COSTS_PERCENT / 100);

  // Speculation tax (only if held less than 10 years)
  let speculationTax = 0;
  if (speculationTaxApplies && grossProfit > 0) {
    speculationTax = grossProfit * (personalTaxRate / 100);
  }

  const netProfit = grossProfit - sellingCosts - speculationTax;
  const totalReturn = netProfit + cumulativeCashflow;

  // Net proceeds after paying off remaining debt
  const netProceedsAfterDebt = currentValue - sellingCosts - speculationTax - remainingDebt;

  // Equity build-up through principal payments (Tilgung)
  const equityBuildUp = totalTilgung;

  // Return on Equity: Total return divided by initial equity
  const returnOnEquity = equity > 0 ? (totalReturn / equity) * 100 : 0;

  // Equity Multiplier: How many times the equity has grown
  const equityMultiplier = equity > 0 ? (equity + totalReturn) / equity : 0;

  // Annualized return based on equity
  const annualizedReturn =
    holdingPeriodYears > 0 && equity > 0
      ? (Math.pow((equity + totalReturn) / equity, 1 / holdingPeriodYears) - 1) * 100
      : 0;

  // Format currency for recommendation message
  const formattedTax = currencyFormatter.format(speculationTax);

  let recommendation: string;
  if (speculationTaxApplies) {
    recommendation = `⚠️ Spekulationssteuer fällt an (${formattedTax}). Ein Verkauf nach der 10-Jahres-Frist wäre steuerlich günstiger.`;
  } else if (annualizedReturn >= 8) {
    recommendation =
      "🟢 Sehr gute Rendite! Ein Verkauf kann sinnvoll sein, um Gewinne zu realisieren.";
  } else if (annualizedReturn >= 5) {
    recommendation = "🟡 Solide Rendite. Weitere Haltedauer könnte die Rendite noch verbessern.";
  } else if (annualizedReturn >= 2) {
    recommendation = "🟠 Moderate Rendite. Ein Verkauf sollte gut überlegt sein.";
  } else {
    recommendation =
      "🔴 Niedrige oder negative Rendite. Weitere Haltedauer könnte empfehlenswert sein.";
  }

  return {
    grossProfit,
    sellingCosts,
    speculationTax,
    netProfit,
    totalReturn,
    annualizedReturn,
    equityMultiplier,
    returnOnEquity,
    equityBuildUp,
    netProceedsAfterDebt,
    recommendation,
  };
}

/**
 * Calculate location analysis score
 */
export function calculateLocationAnalysis(input: LocationAnalysisInput): LocationAnalysisResult {
  let score = 50; // Base score
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Population trend (0-15 points)
  switch (input.populationTrend) {
    case "WACHSEND":
      score += 15;
      strengths.push("Wachsende Bevölkerung");
      break;
    case "STABIL":
      score += 8;
      break;
    case "SCHRUMPFEND":
      score -= 10;
      weaknesses.push("Schrumpfende Bevölkerung");
      break;
  }

  // Employment rate (0-15 points)
  switch (input.employmentRate) {
    case "HOCH":
      score += 15;
      strengths.push("Hohe Beschäftigungsrate");
      break;
    case "MITTEL":
      score += 8;
      break;
    case "NIEDRIG":
      score -= 8;
      weaknesses.push("Niedrige Beschäftigungsrate");
      break;
  }

  // Infrastructure scores (0-20 points total)
  const avgInfraScore =
    (input.infrastructureScore +
      input.publicTransportScore +
      input.shoppingScore +
      input.schoolsScore) /
    4;
  score += (avgInfraScore - 5) * 4; // -20 to +20 adjustment

  if (avgInfraScore >= 7) strengths.push("Gute Infrastruktur");
  if (avgInfraScore < 4) weaknesses.push("Schwache Infrastruktur");

  if (input.publicTransportScore >= 8) strengths.push("Sehr gute ÖPNV-Anbindung");
  if (input.publicTransportScore <= 3) weaknesses.push("Schlechte ÖPNV-Anbindung");

  // Crime rate (-15 to +10 points)
  switch (input.crimeRate) {
    case "NIEDRIG":
      score += 10;
      strengths.push("Niedrige Kriminalitätsrate");
      break;
    case "MITTEL":
      score += 0;
      break;
    case "HOCH":
      score -= 15;
      weaknesses.push("Hohe Kriminalitätsrate");
      break;
  }

  // Rental demand (0-15 points)
  switch (input.rentalDemand) {
    case "SEHR_HOCH":
      score += 15;
      strengths.push("Sehr hohe Mietnachfrage");
      break;
    case "HOCH":
      score += 10;
      strengths.push("Hohe Mietnachfrage");
      break;
    case "MITTEL":
      score += 5;
      break;
    case "NIEDRIG":
      score -= 10;
      weaknesses.push("Niedrige Mietnachfrage");
      break;
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine location quality
  let locationQuality: LocationQuality;
  if (score >= 80) locationQuality = "A";
  else if (score >= 60) locationQuality = "B";
  else if (score >= 40) locationQuality = "C";
  else locationQuality = "D";

  // Investment recommendation
  let investmentRecommendation: LocationAnalysisResult["investmentRecommendation"];
  if (score >= 75) investmentRecommendation = "STARK_EMPFOHLEN";
  else if (score >= 55) investmentRecommendation = "EMPFOHLEN";
  else if (score >= 35) investmentRecommendation = "NEUTRAL";
  else investmentRecommendation = "NICHT_EMPFOHLEN";

  // Risk level
  let riskLevel: LocationAnalysisResult["riskLevel"];
  if (score >= 65) riskLevel = "NIEDRIG";
  else if (score >= 40) riskLevel = "MITTEL";
  else riskLevel = "HOCH";

  return {
    overallScore: Math.round(score),
    locationQuality,
    investmentRecommendation,
    strengths,
    weaknesses,
    riskLevel,
  };
}
