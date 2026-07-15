/**
 * ImmoCalc Pro - Core Calculation Engine
 *
 * Core calculation logic for real estate investment analysis
 * following German tax and financial standards.
 */

import {
  PropertyInput,
  PropertyOutput,
  SideCosts,
  InvestmentVolume,
  FinancingResult,
  CashflowResult,
  YieldMetrics,
} from "@/types";
import { calculateTax } from "./tax";
import { generateAmortizationSchedule, calculateCumulativeCashflow } from "./amortization";
import { calculateInvestmentReturns } from "./returns";

/**
 * Calculate side costs (Nebenkosten)
 */
export function calculateSideCosts(input: PropertyInput): SideCosts {
  const brokerCost = (input.purchasePrice * input.brokerPercent) / 100;
  const notaryCost = (input.purchasePrice * input.notaryPercent) / 100;
  const propertyTransferTax = (input.purchasePrice * input.propertyTransferTaxPercent) / 100;
  const renovationCosts = input.renovationCosts;

  const totalSideCosts = brokerCost + notaryCost + propertyTransferTax + renovationCosts;
  const totalSideCostsPercent =
    input.purchasePrice > 0 ? (totalSideCosts / input.purchasePrice) * 100 : 0;

  return {
    brokerCost,
    notaryCost,
    propertyTransferTax,
    renovationCosts,
    totalSideCosts,
    totalSideCostsPercent,
  };
}

/**
 * Calculate total investment volume
 */
export function calculateInvestmentVolume(input: PropertyInput): InvestmentVolume {
  const sideCosts = calculateSideCosts(input);

  return {
    purchasePrice: input.purchasePrice,
    sideCosts,
    totalInvestment: input.purchasePrice + sideCosts.totalSideCosts,
  };
}

/**
 * Calculate financing details (annuity loan)
 */
export function calculateFinancing(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  years: number
): FinancingResult {
  if (loanAmount <= 0) {
    return {
      loanAmount: 0,
      monthlyPayment: 0,
      annualPayment: 0,
      totalCost: 0,
      totalInterest: 0,
    };
  }

  // Calculate annuity (German: Annuität = Zins + Tilgung)
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;
  const monthlyPayment = annualPayment / 12;

  // Calculate total interest over loan period using amortization simulation
  const interestRate = interestRatePercent / 100;
  let remainingBalance = loanAmount;
  let totalInterest = 0;

  for (let year = 0; year < years; year++) {
    if (remainingBalance <= 0) break;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    totalInterest += interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
  }

  const totalCost = loanAmount + totalInterest;

  return {
    loanAmount,
    monthlyPayment,
    annualPayment,
    totalCost,
    totalInterest,
  };
}

/**
 * Calculate cashflow
 */
export function calculateCashflow(
  input: PropertyInput,
  financing: FinancingResult,
  tax: ReturnType<typeof calculateTax>
): CashflowResult {
  const grossRentalIncome = input.coldRentActual * 12;
  const vacancyDeduction = (grossRentalIncome * input.vacancyRiskPercent) / 100;
  const netRentalIncome = grossRentalIncome - vacancyDeduction;

  const operatingCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;
  const annualDebtService = financing.annualPayment;

  const cashflowBeforeTax = netRentalIncome - operatingCosts - annualDebtService;
  const taxEffect = tax.taxEffect;
  const cashflowAfterTax = cashflowBeforeTax + taxEffect;

  return {
    grossRentalIncome,
    vacancyDeduction,
    netRentalIncome,
    operatingCosts,
    annualDebtService,
    cashflowBeforeTax,
    taxEffect,
    cashflowAfterTax,
    monthlyCashflowBeforeTax: cashflowBeforeTax / 12,
    monthlyCashflowAfterTax: cashflowAfterTax / 12,
  };
}

/**
 * Calculate yield metrics
 */
export function calculateYields(
  input: PropertyInput,
  investment: InvestmentVolume,
  cashflow: CashflowResult
): YieldMetrics {
  const { purchasePrice, totalInvestment } = investment;
  const equity = input.equity;

  // Gross rental yield: Annual rent / Purchase price
  const grossRentalYield =
    purchasePrice > 0 ? (cashflow.grossRentalIncome / purchasePrice) * 100 : 0;

  // Net rental yield: (Net rent - operating costs) / Total investment
  const netRentalYield =
    totalInvestment > 0
      ? ((cashflow.netRentalIncome - cashflow.operatingCosts) / totalInvestment) * 100
      : 0;

  // Return on equity: Cashflow after tax / Equity
  const returnOnEquity = equity > 0 ? (cashflow.cashflowAfterTax / equity) * 100 : 0;

  // Cashflow yield: Cashflow after tax / Total investment
  const cashflowYield =
    totalInvestment > 0 ? (cashflow.cashflowAfterTax / totalInvestment) * 100 : 0;

  // Object yield (same as net rental yield for simplicity)
  const objectYield = netRentalYield;

  return {
    grossRentalYield,
    netRentalYield,
    returnOnEquity,
    cashflowYield,
    objectYield,
  };
}

/**
 * Sanitize a numeric value: replace NaN/Infinity with a default, clamp to range
 */
function sanitizeNumber(value: number, defaultValue: number, min?: number, max?: number): number {
  if (!Number.isFinite(value)) return defaultValue;
  let result = value;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

/**
 * Sanitize property input to prevent invalid calculations.
 * Ensures all numeric fields are finite and within reasonable bounds.
 */
function sanitizeInput(input: PropertyInput): PropertyInput {
  return {
    ...input,
    purchasePrice: sanitizeNumber(input.purchasePrice, 0, 0),
    brokerPercent: sanitizeNumber(input.brokerPercent, 0, 0, 100),
    notaryPercent: sanitizeNumber(input.notaryPercent, 0, 0, 100),
    propertyTransferTaxPercent: sanitizeNumber(input.propertyTransferTaxPercent, 0, 0, 100),
    renovationCosts: sanitizeNumber(input.renovationCosts, 0, 0),
    equity: sanitizeNumber(input.equity, 0, 0),
    loanAmount: input.loanAmount !== undefined ? sanitizeNumber(input.loanAmount, 0, 0) : undefined,
    interestRate: sanitizeNumber(input.interestRate, 0, 0, 100),
    repaymentRate: sanitizeNumber(input.repaymentRate, 0, 0, 100),
    fixedInterestPeriod: sanitizeNumber(input.fixedInterestPeriod, 10, 1, 50),
    coldRentActual: sanitizeNumber(input.coldRentActual, 0, 0),
    coldRentTarget: sanitizeNumber(input.coldRentTarget, 0, 0),
    nonRecoverableCosts: sanitizeNumber(input.nonRecoverableCosts, 0, 0),
    maintenanceReserve: sanitizeNumber(input.maintenanceReserve, 0, 0),
    vacancyRiskPercent: sanitizeNumber(input.vacancyRiskPercent, 0, 0, 100),
    personalTaxRate: sanitizeNumber(input.personalTaxRate, 0, 0, 100),
    buildingSharePercent: sanitizeNumber(input.buildingSharePercent, 0, 0, 100),
    expectedAppreciationPercent: sanitizeNumber(input.expectedAppreciationPercent, 0, -50, 50),
    expectedRentIncreasePercent: sanitizeNumber(input.expectedRentIncreasePercent, 0, -50, 50),
  };
}

/**
 * Calculate all KPIs for a property
 * This is the main entry point for the calculation engine
 */
export function calculatePropertyKPIs(raw: PropertyInput): PropertyOutput {
  const input = sanitizeInput(raw);

  // 1. Calculate investment volume
  const investmentVolume = calculateInvestmentVolume(input);

  // 2. Calculate loan amount (total investment - equity)
  const loanAmount = investmentVolume.totalInvestment - input.equity;

  // 3. Calculate financing
  const financing = calculateFinancing(
    loanAmount,
    input.interestRate,
    input.repaymentRate,
    input.fixedInterestPeriod
  );

  // 4. Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    input.interestRate,
    input.repaymentRate,
    input.fixedInterestPeriod
  );

  // 5. Use Year 1 interest for tax calculation (consistent with KPI display and charts)
  const year1Interest =
    amortizationSchedule.length > 0 ? amortizationSchedule[0].interestPayment : 0;

  // 6. Calculate tax effects
  const tax = calculateTax(input, year1Interest);

  // 7. Calculate cashflow
  const cashflow = calculateCashflow(input, financing, tax);

  // 8. Calculate yields
  const yields = calculateYields(input, investmentVolume, cashflow);

  // 9. Calculate cumulative cashflow projection
  const cumulativeCashflow = calculateCumulativeCashflow(
    input.purchasePrice,
    amortizationSchedule,
    cashflow.cashflowAfterTax,
    input.expectedAppreciationPercent
  );

  // 10. Calculate time-weighted investment returns (IRR, total return)
  const investmentReturns = calculateInvestmentReturns(input);

  return {
    investmentVolume,
    financing,
    cashflow,
    yields,
    tax,
    amortizationSchedule,
    cumulativeCashflow,
    investmentReturns,
  };
}

/**
 * Get default property input values
 */
export function getDefaultPropertyInput(): PropertyInput {
  return {
    // Purchase & Costs
    purchasePrice: 300000,
    brokerPercent: 3.57,
    notaryPercent: 2.0,
    propertyTransferTaxPercent: 3.5, // Bayern
    renovationCosts: 0,

    // Family Purchase
    isFamilyPurchase: false,
    marketValue: undefined,

    // Bundesland
    bundesland: "BAYERN",

    // Financing
    equity: 60000,
    loanAmount: 0, // Calculated from totalInvestment - equity in calculatePropertyKPIs
    interestRate: 3.5,
    repaymentRate: 2.0,
    fixedInterestPeriod: 15,

    // Operations
    coldRentActual: 1000,
    coldRentTarget: 1000,
    nonRecoverableCosts: 100,
    maintenanceReserve: 50,
    vacancyRiskPercent: 2.0,

    // Tax
    personalTaxRate: 35.0,
    buildingSharePercent: 75.0,
    afaType: "ALTBAU_AB_1925",

    // Movable Assets
    movableAssetsValue: 0,
    movableAssetsDepreciationYears: 10,

    // Forecast/Prognose
    expectedAppreciationPercent: 2.0, // 2% annual appreciation
    expectedRentIncreasePercent: 1.5, // 1.5% annual rent increase
  };
}
