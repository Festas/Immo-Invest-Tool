/**
 * ImmoCalc Pro - Chart & Calculation Utilities
 */

import { ExtendedCashflowPoint } from "@/types";

/**
 * Sanitize a numeric value: replace NaN/Infinity with a default and clamp to
 * an optional [min, max] range. Shared guard used across the calculation
 * engine to keep boundary inputs (0, ∞, negative) from producing NaN/Infinity.
 */
export function sanitizeNumber(
  value: number,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  // Number.isFinite is false for NaN, Infinity and -Infinity, so this single
  // check covers all non-finite cases.
  if (!Number.isFinite(value)) return defaultValue;
  let result = value;
  if (min !== undefined) result = Math.max(result, min);
  if (max !== undefined) result = Math.min(result, max);
  return result;
}

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
