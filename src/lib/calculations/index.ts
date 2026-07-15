/**
 * ImmoCalc Pro - Calculation Engine
 *
 * Re-exports all calculation functions for backward compatibility.
 * The calculation logic is split into domain modules:
 * - core.ts: Side costs, investment volume, financing, cashflow, yields, KPI aggregation
 * - tax.ts: AfA and tax calculations
 * - amortization.ts: Amortization schedules and cashflow projections
 * - features.ts: Rent index, break-even, renovation ROI, exit strategy, location analysis
 * - utils.ts: Chart utilities
 */

// Core calculations
export {
  calculateSideCosts,
  calculateInvestmentVolume,
  calculateFinancing,
  calculateCashflow,
  calculateYields,
  calculatePropertyKPIs,
  getDefaultPropertyInput,
} from "./core";

// Tax calculations
export { calculateAfA, calculateTax } from "./tax";

// Amortization & projections
export {
  generateAmortizationSchedule,
  calculateCumulativeCashflow,
  calculateYearsToFullRepayment,
  generateFullAmortizationSchedule,
  calculateExtendedCashflowProjection,
} from "./amortization";

// Feature calculators
export {
  calculateRentIndex,
  calculateBreakEven,
  calculateRenovationROI,
  calculateExitStrategy,
  calculateLocationAnalysis,
} from "./features";

// Utilities
export { calculateLoanAmount, getChartInterval, addCumulativeCashflow } from "./utils";

// Investment returns (IRR, total return, equity multiplier)
export { calculateIRR, calculateInvestmentReturns } from "./returns";
