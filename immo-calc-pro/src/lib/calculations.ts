/**
 * ImmoCalc Pro - Calculation Engine
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
  TaxResult,
  AmortizationYear,
  CumulativeCashflowPoint,
  AfARates,
} from "@/types";

/**
 * Calculate side costs (Nebenkosten)
 */
export function calculateSideCosts(input: PropertyInput): SideCosts {
  const brokerCost = (input.purchasePrice * input.brokerPercent) / 100;
  const notaryCost = (input.purchasePrice * input.notaryPercent) / 100;
  const propertyTransferTax = (input.purchasePrice * input.propertyTransferTaxPercent) / 100;
  const renovationCosts = input.renovationCosts;

  const totalSideCosts = brokerCost + notaryCost + propertyTransferTax + renovationCosts;
  const totalSideCostsPercent = input.purchasePrice > 0 
    ? (totalSideCosts / input.purchasePrice) * 100 
    : 0;

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
 * Calculate AfA (depreciation) according to German tax law
 */
export function calculateAfA(
  purchasePrice: number,
  buildingSharePercent: number,
  afaType: PropertyInput["afaType"]
): number {
  const buildingValue = (purchasePrice * buildingSharePercent) / 100;
  const afaRate = AfARates[afaType].rate;
  return (buildingValue * afaRate) / 100;
}

/**
 * Calculate tax effects for rental property
 */
export function calculateTax(
  input: PropertyInput,
  annualInterest: number
): TaxResult {
  const afaAmount = calculateAfA(input.purchasePrice, input.buildingSharePercent, input.afaType);
  const deductibleInterest = annualInterest;
  const deductibleCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;

  const totalDeductions = afaAmount + deductibleInterest + deductibleCosts;
  const grossRentalIncome = input.coldRentActual * 12;
  const rentalIncomeAfterDeductions = grossRentalIncome - totalDeductions;

  // Tax effect: negative income = tax benefit, positive income = tax liability
  const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;
  const monthlyTaxEffect = taxEffect / 12;

  return {
    afaAmount,
    deductibleInterest,
    deductibleCosts,
    totalDeductions,
    rentalIncomeAfterDeductions,
    taxEffect,
    monthlyTaxEffect,
  };
}

/**
 * Calculate cashflow
 */
export function calculateCashflow(
  input: PropertyInput,
  financing: FinancingResult,
  tax: TaxResult
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
  const grossRentalYield = purchasePrice > 0 
    ? (cashflow.grossRentalIncome / purchasePrice) * 100 
    : 0;

  // Net rental yield: (Net rent - operating costs) / Total investment
  const netRentalYield = totalInvestment > 0 
    ? ((cashflow.netRentalIncome - cashflow.operatingCosts) / totalInvestment) * 100 
    : 0;

  // Return on equity: Cashflow after tax / Equity
  const returnOnEquity = equity > 0 
    ? (cashflow.cashflowAfterTax / equity) * 100 
    : 0;

  // Cashflow yield: Cashflow after tax / Total investment
  const cashflowYield = totalInvestment > 0 
    ? (cashflow.cashflowAfterTax / totalInvestment) * 100 
    : 0;

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
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  years: number
): AmortizationYear[] {
  if (loanAmount <= 0) return [];

  const schedule: AmortizationYear[] = [];
  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let year = 1; year <= years; year++) {
    if (remainingBalance <= 0) break;

    const startingBalance = remainingBalance;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;

    schedule.push({
      year,
      startingBalance,
      interestPayment,
      principalPayment,
      endingBalance: remainingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  return schedule;
}

/**
 * Calculate cumulative cashflow and net worth projection
 */
export function calculateCumulativeCashflow(
  purchasePrice: number,
  amortizationSchedule: AmortizationYear[],
  annualCashflow: number,
  annualAppreciationPercent: number = 1.5
): CumulativeCashflowPoint[] {
  if (amortizationSchedule.length === 0) return [];

  const points: CumulativeCashflowPoint[] = [];
  let cumulativeCashflow = 0;
  let propertyValue = purchasePrice;
  const appreciationRate = 1 + annualAppreciationPercent / 100;

  for (const yearData of amortizationSchedule) {
    propertyValue *= appreciationRate;
    cumulativeCashflow += annualCashflow;
    const remainingDebt = yearData.endingBalance;
    const netWorth = propertyValue - remainingDebt + cumulativeCashflow;

    points.push({
      year: yearData.year,
      cumulativeCashflow,
      propertyValue,
      remainingDebt,
      netWorth,
    });
  }

  return points;
}

/**
 * Calculate all KPIs for a property
 * This is the main entry point for the calculation engine
 */
export function calculatePropertyKPIs(input: PropertyInput): PropertyOutput {
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

  // 5. Calculate average interest for tax calculation
  const averageAnnualInterest = amortizationSchedule.length > 0
    ? amortizationSchedule.reduce((sum, year) => sum + year.interestPayment, 0) / amortizationSchedule.length
    : 0;

  // 6. Calculate tax effects
  const tax = calculateTax(input, averageAnnualInterest);

  // 7. Calculate cashflow
  const cashflow = calculateCashflow(input, financing, tax);

  // 8. Calculate yields
  const yields = calculateYields(input, investmentVolume, cashflow);

  // 9. Calculate cumulative cashflow projection
  const cumulativeCashflow = calculateCumulativeCashflow(
    input.purchasePrice,
    amortizationSchedule,
    cashflow.cashflowAfterTax,
    1.5 // 1.5% annual appreciation
  );

  return {
    investmentVolume,
    financing,
    cashflow,
    yields,
    tax,
    amortizationSchedule,
    cumulativeCashflow,
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
  };
}
