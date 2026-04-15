/**
 * ImmoCalc Pro - Tax Calculation Module
 *
 * AfA and tax effect calculations following German tax law.
 */

import { PropertyInput, TaxResult, AfARates } from "@/types";

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
export function calculateTax(input: PropertyInput, annualInterest: number): TaxResult {
  const afaAmount = calculateAfA(input.purchasePrice, input.buildingSharePercent, input.afaType);

  // Calculate movable assets AfA (e.g., fitted kitchen)
  const movableAssetsValue = input.movableAssetsValue ?? 0;
  const movableAssetsDepreciationYears = input.movableAssetsDepreciationYears ?? 10;
  const movableAssetsAfA =
    movableAssetsValue > 0 && movableAssetsDepreciationYears > 0
      ? movableAssetsValue / movableAssetsDepreciationYears
      : 0;

  const deductibleInterest = annualInterest;
  const deductibleCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;

  // Total deductions include building AfA, movable assets AfA, interest, and costs
  const totalDeductions = afaAmount + movableAssetsAfA + deductibleInterest + deductibleCosts;
  const grossRentalIncome = input.coldRentActual * 12;
  const rentalIncomeAfterDeductions = grossRentalIncome - totalDeductions;

  // Tax effect: negative income = tax benefit, positive income = tax liability
  const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;
  const monthlyTaxEffect = taxEffect / 12;

  return {
    afaAmount,
    movableAssetsAfA,
    deductibleInterest,
    deductibleCosts,
    totalDeductions,
    rentalIncomeAfterDeductions,
    taxEffect,
    monthlyTaxEffect,
  };
}
