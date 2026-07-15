/**
 * ImmoCalc Pro - Investment Returns Module
 *
 * Time-weighted return measures for the full projected holding period:
 * after-tax internal rate of return (IRR), lifetime total return, and the
 * equity multiplier. These complement the point-in-time yield metrics by
 * accounting for equity invested at t0, every projected after-tax cashflow,
 * and the equity recovered on exit (sale proceeds net of remaining debt).
 *
 * All functions are pure and side-effect free.
 */

import { PropertyInput, InvestmentReturns } from "@/types";
import { calculateInvestmentVolume } from "./core";
import { generateAmortizationSchedule, calculateExtendedCashflowProjection } from "./amortization";

/** German speculation-tax period: gains are tax-free after 10 years. */
const SPECULATION_TAX_PERIOD_YEARS = 10;
/** Default transaction costs on sale (broker, notary, etc.). */
const DEFAULT_SELLING_COSTS_PERCENT = 6;

/**
 * Compute the internal rate of return of a series of annual cashflows.
 *
 * `cashflows[0]` is the flow at time 0 (typically the negative equity
 * outlay); each subsequent entry is the net flow at the end of that year.
 * The IRR is the discount rate `r` for which the net present value is zero.
 *
 * Uses Newton–Raphson with a robust bisection fallback so it converges even
 * for irregular streams. Returns `null` when an IRR is undefined, i.e. the
 * stream never changes sign (all non-positive or all non-negative flows).
 *
 * @param cashflows Annual cashflows, index 0 = time 0.
 * @returns IRR as a percentage (e.g. `7.5` for 7.5 %), or `null`.
 */
export function calculateIRR(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;

  // An IRR only exists if there is at least one sign change.
  const hasPositive = cashflows.some((c) => c > 0);
  const hasNegative = cashflows.some((c) => c < 0);
  if (!hasPositive || !hasNegative) return null;

  const npv = (rate: number): number =>
    cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

  // --- Bisection over a wide, well-defined bracket ---------------------
  // Rates below -100 % are meaningless (a factor <= 0), so the lower bound
  // stays just above -1. The upper bound is generous for real estate.
  let low = -0.9999;
  let high = 10; // 1000 %
  let npvLow = npv(low);
  let npvHigh = npv(high);

  // If the bracket does not straddle a root, IRR is not resolvable here.
  if (npvLow * npvHigh > 0) return null;

  let rate = 0.1;
  for (let i = 0; i < 200; i++) {
    rate = (low + high) / 2;
    const value = npv(rate);
    if (Math.abs(value) < 1e-7 || (high - low) / 2 < 1e-9) {
      return rate * 100;
    }
    if (value * npvLow < 0) {
      high = rate;
      npvHigh = value;
    } else {
      low = rate;
      npvLow = value;
    }
  }

  return rate * 100;
}

/**
 * Calculate lifetime investment returns for a property over a holding period.
 *
 * The projection reuses the audited amortization and extended-cashflow
 * engine, then derives an equity cashflow stream (equity out at t0, annual
 * after-tax cashflows, sale proceeds at exit) to compute the after-tax IRR,
 * total profit, and equity multiplier.
 *
 * German speculation tax (Spekulationssteuer) is applied to the sale gain
 * when the holding period is shorter than {@link SPECULATION_TAX_PERIOD_YEARS}.
 *
 * @param input Property input parameters.
 * @param exitYear Holding period in years. Defaults to the fixed-interest
 *   period. Clamped to a minimum of 1.
 * @param sellingCostsPercent Transaction costs on sale, as a percent.
 */
export function calculateInvestmentReturns(
  input: PropertyInput,
  exitYear: number = input.fixedInterestPeriod,
  sellingCostsPercent: number = DEFAULT_SELLING_COSTS_PERCENT
): InvestmentReturns {
  const horizon = Math.max(1, Math.round(exitYear));

  const investmentVolume = calculateInvestmentVolume(input);
  const totalInvestment = investmentVolume.totalInvestment;
  const loanAmount = Math.max(0, totalInvestment - input.equity);
  // Equity actually deployed (never exceeds the total investment).
  const initialEquity = totalInvestment - loanAmount;

  const schedule = generateAmortizationSchedule(
    loanAmount,
    input.interestRate,
    input.repaymentRate,
    horizon
  );

  const projection = calculateExtendedCashflowProjection(input, schedule, horizon).filter(
    (point) => point.year <= horizon
  );

  // Terminal point: the latest projected year within the horizon.
  const terminal = projection[projection.length - 1];
  const exitPropertyValue = terminal
    ? terminal.propertyValue
    : input.purchasePrice * Math.pow(1 + input.expectedAppreciationPercent / 100, horizon);
  const exitRemainingDebt = terminal ? terminal.remainingDebt : 0;

  const totalCashflow = projection.reduce((acc, point) => acc + point.cashflowAfterTax, 0);

  // --- Sale proceeds at exit -------------------------------------------
  const sellingCosts = exitPropertyValue * (sellingCostsPercent / 100);
  const saleGain = exitPropertyValue - input.purchasePrice;
  const speculationTaxApplies = horizon < SPECULATION_TAX_PERIOD_YEARS && saleGain > 0;
  const speculationTax = speculationTaxApplies ? (saleGain * input.personalTaxRate) / 100 : 0;
  const exitNetProceeds = exitPropertyValue - sellingCosts - speculationTax - exitRemainingDebt;

  const totalProfit = totalCashflow + exitNetProceeds - initialEquity;
  const equityMultiplier = initialEquity > 0 ? (initialEquity + totalProfit) / initialEquity : 0;
  const annualizedReturn =
    initialEquity > 0 && equityMultiplier > 0
      ? (Math.pow(equityMultiplier, 1 / horizon) - 1) * 100
      : 0;

  // --- Equity cashflow stream for IRR ----------------------------------
  const equityFlows: number[] = [-initialEquity];
  for (let year = 1; year <= horizon; year++) {
    const point = projection.find((p) => p.year === year);
    const annualCashflow = point ? point.cashflowAfterTax : 0;
    if (year === horizon) {
      equityFlows.push(annualCashflow + exitNetProceeds);
    } else {
      equityFlows.push(annualCashflow);
    }
  }

  const irr = initialEquity > 0 ? calculateIRR(equityFlows) : null;

  return {
    exitYear: horizon,
    initialEquity,
    totalCashflow,
    exitPropertyValue,
    exitRemainingDebt,
    exitNetProceeds,
    totalProfit,
    equityMultiplier,
    irr,
    annualizedReturn,
  };
}
