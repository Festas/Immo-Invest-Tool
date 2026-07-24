/**
 * ImmoCalc Pro - Tax Calculation Module
 *
 * AfA and tax effect calculations following German tax law.
 */

import { PropertyInput, TaxResult, AfARates } from "@/types";

/**
 * Calculate AfA (depreciation) according to German tax law.
 *
 * Movable assets (e.g. a fitted kitchen) are depreciated separately, so their
 * value must be removed from the building's depreciation base to avoid
 * double-counting. This guarantees that the sum of all depreciation bases
 * (building + movable assets) never exceeds the purchase price.
 *
 * @param movableAssetsValue Value of separately depreciated movable assets in €.
 */
export function calculateAfA(
  purchasePrice: number,
  buildingSharePercent: number,
  afaType: PropertyInput["afaType"],
  movableAssetsValue: number = 0
): number {
  // Purchase price attributable to real estate (excl. movable assets).
  const realEstateValue = Math.max(0, purchasePrice - Math.max(0, movableAssetsValue));
  const buildingValue = (realEstateValue * buildingSharePercent) / 100;
  const afaRate = AfARates[afaType].rate;
  return (buildingValue * afaRate) / 100;
}

/**
 * Calculate tax effects for rental property
 */
export function calculateTax(input: PropertyInput, annualInterest: number): TaxResult {
  // Calculate movable assets AfA (e.g., fitted kitchen)
  const movableAssetsValue = input.movableAssetsValue ?? 0;
  const movableAssetsDepreciationYears = input.movableAssetsDepreciationYears ?? 10;
  const movableAssetsAfA =
    movableAssetsValue > 0 && movableAssetsDepreciationYears > 0
      ? movableAssetsValue / movableAssetsDepreciationYears
      : 0;

  // Building AfA base excludes the value of separately depreciated movable
  // assets so the total depreciation base never exceeds the purchase price.
  const afaAmount = calculateAfA(
    input.purchasePrice,
    input.buildingSharePercent,
    input.afaType,
    movableAssetsValue
  );

  const deductibleInterest = annualInterest;
  const deductibleCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;

  // Total deductions include building AfA, movable assets AfA, interest, and costs
  const totalDeductions = afaAmount + movableAssetsAfA + deductibleInterest + deductibleCosts;

  // Taxable rental income is the rent actually received, i.e. net of the
  // assumed vacancy loss. This keeps the tax base consistent with the cashflow
  // calculation (see calculateCashflow), which also deducts the vacancy loss.
  const grossRentalIncome = input.coldRentActual * 12;
  const vacancyDeduction = (grossRentalIncome * input.vacancyRiskPercent) / 100;
  const netRentalIncome = grossRentalIncome - vacancyDeduction;
  const rentalIncomeAfterDeductions = netRentalIncome - totalDeductions;

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
