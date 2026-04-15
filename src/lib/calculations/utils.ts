/**
 * ImmoCalc Pro - Chart & Calculation Utilities
 */

import { ExtendedCashflowPoint } from "@/types";

/**
 * Calculate loan amount from investment volume and equity
 */
export function calculateLoanAmount(totalInvestment: number, equity: number): number {
  return totalInvestment - equity;
}

/**
 * Determine optimal chart interval based on total years
 */
export function getChartInterval(totalYears: number): number {
  if (totalYears > 30) return 5;
  if (totalYears > 15) return 3;
  return 2;
}

/**
 * Transform cashflow projection to include cumulative cashflow
 * Useful for charting cumulative cashflow over time
 */
export function addCumulativeCashflow(
  cashflowProjection: ExtendedCashflowPoint[]
): Array<ExtendedCashflowPoint & { cumulativeCashflow: number }> {
  let cumulative = 0;
  return cashflowProjection.map((point) => {
    cumulative += point.cashflowAfterTax;
    return {
      ...point,
      cumulativeCashflow: cumulative,
    };
  });
}
