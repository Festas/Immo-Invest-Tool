/**
 * ImmoCalc Pro - Amortization & Projection Module
 *
 * Schedule generation and cashflow projections.
 */

import {
  PropertyInput,
  AmortizationYear,
  CumulativeCashflowPoint,
  ExtendedCashflowPoint,
  AfARates,
} from "@/types";

// Constants
const OPERATING_COSTS_INFLATION_RATE = 0.02; // 2% annual inflation for operating costs
const DEBT_FREE_YEARS_TO_ADD = 1; // Number of debt-free years to show after complete repayment

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
  annualAppreciationPercent: number = 2.0
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
 * Calculate years until full loan repayment
 */
export function calculateYearsToFullRepayment(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number
): number {
  if (loanAmount <= 0) return 0;

  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let years = 0;
  const maxYears = 100; // Safety limit

  while (remainingBalance > 0.01 && years < maxYears) {
    years++;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
  }

  return years;
}

/**
 * Generate full amortization schedule until complete repayment
 */
export function generateFullAmortizationSchedule(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  maxYears: number = 50
): AmortizationYear[] {
  if (loanAmount <= 0) return [];

  const schedule: AmortizationYear[] = [];
  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let year = 1;

  while (remainingBalance > 0.01 && year <= maxYears) {
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

    year++;
  }

  return schedule;
}

/**
 * Calculate extended cashflow projection with dynamic factors
 */
export function calculateExtendedCashflowProjection(
  input: PropertyInput,
  amortizationSchedule: AmortizationYear[],
  yearsToProject: number
): ExtendedCashflowPoint[] {
  if (amortizationSchedule.length === 0) return [];

  const points: ExtendedCashflowPoint[] = [];
  const inflationRate = OPERATING_COSTS_INFLATION_RATE;
  const rentIncreaseRate = input.expectedRentIncreasePercent / 100;
  const appreciationRate = input.expectedAppreciationPercent / 100;

  // Initial values
  let currentRent = input.coldRentActual * 12; // Annual gross rent
  let currentOperatingCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12; // Annual operating costs
  let propertyValue = input.purchasePrice;

  const years = Math.min(yearsToProject, amortizationSchedule.length);

  // Calculate AfA (depreciation) - constant for simplified calculation
  const buildingValue = (input.purchasePrice * input.buildingSharePercent) / 100;
  const afaRate = AfARates[input.afaType].rate;
  const afaAmount = (buildingValue * afaRate) / 100;

  // Calculate movable assets AfA (e.g., fitted kitchen)
  const movableAssetsValue = input.movableAssetsValue ?? 0;
  const movableAssetsDepreciationYears = input.movableAssetsDepreciationYears ?? 10;
  const movableAssetsAfAPerYear =
    movableAssetsValue > 0 && movableAssetsDepreciationYears > 0
      ? movableAssetsValue / movableAssetsDepreciationYears
      : 0;

  for (let i = 0; i < years; i++) {
    const yearData = amortizationSchedule[i];
    const currentYear = yearData.year;

    // Apply annual increases
    if (i > 0) {
      currentRent *= 1 + rentIncreaseRate;
      currentOperatingCosts *= 1 + inflationRate;
      propertyValue *= 1 + appreciationRate;
    }

    // Calculate rent after vacancy
    const vacancyDeduction = (currentRent * input.vacancyRiskPercent) / 100;
    const netRent = currentRent - vacancyDeduction;

    // Get interest and principal from amortization schedule
    const interestPayment = yearData.interestPayment;
    const principalPayment = yearData.principalPayment;
    const remainingDebt = yearData.endingBalance;

    // Calculate movable assets AfA (only for the depreciation period)
    const currentMovableAssetsAfA =
      currentYear <= (movableAssetsDepreciationYears ?? 10) ? movableAssetsAfAPerYear : 0;

    // Calculate tax deductions (including movable assets AfA if within depreciation period)
    const totalDeductions =
      afaAmount + currentMovableAssetsAfA + interestPayment + currentOperatingCosts;
    const rentalIncomeAfterDeductions = currentRent - totalDeductions;

    // Tax effect: negative income = tax benefit, positive income = tax liability
    const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;

    // Calculate cashflow
    const cashflowBeforeTax = netRent - currentOperatingCosts - interestPayment - principalPayment;
    const cashflowAfterTax = cashflowBeforeTax + taxEffect;
    const monthlyCashflowAfterTax = cashflowAfterTax / 12;

    // Calculate equity value
    const equityValue = propertyValue - remainingDebt;

    points.push({
      year: yearData.year,
      grossRent: currentRent,
      netRent,
      interestPayment,
      principalPayment,
      operatingCosts: currentOperatingCosts,
      cashflowBeforeTax,
      cashflowAfterTax,
      monthlyCashflowAfterTax,
      remainingDebt,
      propertyValue,
      equityValue,
      afaEffect: afaAmount,
      totalTaxEffect: taxEffect,
      isDebtFree: false,
    });
  }

  // Add debt-free years after complete repayment
  for (let extraYear = 1; extraYear <= DEBT_FREE_YEARS_TO_ADD; extraYear++) {
    const year = amortizationSchedule.length + extraYear;

    // Continue to apply annual increases
    currentRent *= 1 + rentIncreaseRate;
    currentOperatingCosts *= 1 + inflationRate;
    propertyValue *= 1 + appreciationRate;

    const vacancyDeduction = (currentRent * input.vacancyRiskPercent) / 100;
    const netRent = currentRent - vacancyDeduction;

    // Calculate movable assets AfA (only for the depreciation period)
    const currentMovableAssetsAfA =
      year <= (movableAssetsDepreciationYears ?? 10) ? movableAssetsAfAPerYear : 0;

    // Calculate tax deductions (only AfA, movable assets AfA if applicable, and operating costs, no interest)
    const totalDeductions = afaAmount + currentMovableAssetsAfA + currentOperatingCosts;
    const rentalIncomeAfterDeductions = currentRent - totalDeductions;

    // Tax effect: negative income = tax benefit, positive income = tax liability
    const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;

    // Cashflow without debt service
    const cashflowBeforeTax = netRent - currentOperatingCosts; // No debt service!
    const cashflowAfterTax = cashflowBeforeTax + taxEffect;
    const monthlyCashflowAfterTax = cashflowAfterTax / 12;

    points.push({
      year,
      grossRent: currentRent,
      netRent,
      interestPayment: 0, // No interest payment when debt-free
      principalPayment: 0, // No principal payment when debt-free
      operatingCosts: currentOperatingCosts,
      cashflowBeforeTax,
      cashflowAfterTax,
      monthlyCashflowAfterTax,
      remainingDebt: 0, // No remaining debt when debt-free
      propertyValue,
      equityValue: propertyValue, // Full property value = equity when debt-free
      afaEffect: afaAmount,
      totalTaxEffect: taxEffect,
      isDebtFree: true,
    });
  }

  return points;
}
