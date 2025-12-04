/**
 * Monte Carlo Simulation for Real Estate Investments
 *
 * Probabilistic return forecasting and risk analysis.
 */

export interface MonteCarloInput {
  initialInvestment: number;
  annualCashflow: number;
  cashflowVariability: number; // percentage standard deviation
  annualAppreciation: number; // expected annual appreciation %
  appreciationVariability: number; // percentage standard deviation
  yearsToSimulate: number;
  numberOfSimulations: number;
}

export interface SimulationResult {
  finalValues: number[];
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  mean: number;
  standardDeviation: number;
  probabilityOfLoss: number;
  probabilityOfDoubling: number;
  yearlyProjections: YearlyProjection[];
}

export interface YearlyProjection {
  year: number;
  mean: number;
  min: number;
  max: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface RiskMetrics {
  valueAtRisk95: number; // 5th percentile loss
  expectedShortfall: number; // Average of worst 5%
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
}

/**
 * Generate a random number from normal distribution
 * Uses Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  let u1 = 0;
  let u2 = 0;
  let iterations = 0;
  const maxIterations = 100;

  // Avoid log(0) with safety limit
  while (u1 === 0 && iterations < maxIterations) {
    u1 = Math.random();
    iterations++;
  }
  iterations = 0;
  while (u2 === 0 && iterations < maxIterations) {
    u2 = Math.random();
    iterations++;
  }

  // Fallback to small positive value if somehow still 0
  if (u1 === 0) u1 = Number.MIN_VALUE;
  if (u2 === 0) u2 = Number.MIN_VALUE;

  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + stdDev * z;
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0;

  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedArray[lower];
  }

  const fraction = index - lower;
  return sortedArray[lower] * (1 - fraction) + sortedArray[upper] * fraction;
}

/**
 * Run Monte Carlo simulation
 */
export function runMonteCarloSimulation(input: MonteCarloInput): SimulationResult {
  const {
    initialInvestment,
    annualCashflow,
    cashflowVariability,
    annualAppreciation,
    appreciationVariability,
    yearsToSimulate,
    numberOfSimulations,
  } = input;

  const simulationResults: number[][] = []; // [simulation][year]
  const finalValues: number[] = [];

  // Run simulations
  for (let sim = 0; sim < numberOfSimulations; sim++) {
    const yearlyValues: number[] = [initialInvestment];
    let propertyValue = initialInvestment;
    let cumulativeCashflow = 0;

    for (let year = 1; year <= yearsToSimulate; year++) {
      // Random appreciation rate for this year
      const yearAppreciation = randomNormal(
        annualAppreciation / 100,
        appreciationVariability / 100
      );
      propertyValue *= 1 + yearAppreciation;

      // Random cashflow variation for this year
      const yearCashflow = randomNormal(
        annualCashflow,
        Math.abs(annualCashflow) * (cashflowVariability / 100)
      );
      cumulativeCashflow += yearCashflow;

      const totalValue = propertyValue + cumulativeCashflow;
      yearlyValues.push(totalValue);
    }

    simulationResults.push(yearlyValues);
    finalValues.push(yearlyValues[yearsToSimulate]);
  }

  // Sort final values for percentile calculations
  const sortedFinalValues = [...finalValues].sort((a, b) => a - b);

  // Calculate statistics
  const mean = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
  const variance =
    finalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / finalValues.length;
  const standardDeviation = Math.sqrt(variance);

  // Probability metrics
  const lossCount = finalValues.filter((v) => v < initialInvestment).length;
  const probabilityOfLoss = (lossCount / finalValues.length) * 100;

  const doubleCount = finalValues.filter((v) => v >= initialInvestment * 2).length;
  const probabilityOfDoubling = (doubleCount / finalValues.length) * 100;

  // Calculate yearly projections
  const yearlyProjections: YearlyProjection[] = [];
  for (let year = 0; year <= yearsToSimulate; year++) {
    const yearValues = simulationResults.map((sim) => sim[year]);
    const sortedYearValues = [...yearValues].sort((a, b) => a - b);

    yearlyProjections.push({
      year,
      mean: yearValues.reduce((a, b) => a + b, 0) / yearValues.length,
      min: Math.min(...yearValues),
      max: Math.max(...yearValues),
      p10: percentile(sortedYearValues, 10),
      p25: percentile(sortedYearValues, 25),
      p50: percentile(sortedYearValues, 50),
      p75: percentile(sortedYearValues, 75),
      p90: percentile(sortedYearValues, 90),
    });
  }

  return {
    finalValues: sortedFinalValues,
    percentiles: {
      p5: percentile(sortedFinalValues, 5),
      p10: percentile(sortedFinalValues, 10),
      p25: percentile(sortedFinalValues, 25),
      p50: percentile(sortedFinalValues, 50),
      p75: percentile(sortedFinalValues, 75),
      p90: percentile(sortedFinalValues, 90),
      p95: percentile(sortedFinalValues, 95),
    },
    mean,
    standardDeviation,
    probabilityOfLoss,
    probabilityOfDoubling,
    yearlyProjections,
  };
}

/**
 * Calculate risk metrics from simulation results
 */
export function calculateRiskMetrics(
  result: SimulationResult,
  initialInvestment: number,
  riskFreeRate: number = 2.0 // Annual risk-free rate in %
): RiskMetrics {
  const { finalValues, mean, standardDeviation, yearlyProjections } = result;
  const years = yearlyProjections.length - 1;

  // Value at Risk (5th percentile)
  const valueAtRisk95 = initialInvestment - result.percentiles.p5;

  // Expected Shortfall (average of worst 5%)
  const worst5Percent = finalValues.slice(0, Math.ceil(finalValues.length * 0.05));
  const expectedShortfall =
    initialInvestment - worst5Percent.reduce((a, b) => a + b, 0) / worst5Percent.length;

  // Annualized return
  const annualizedReturn =
    years > 0 ? (Math.pow(mean / initialInvestment, 1 / years) - 1) * 100 : 0;

  // Annualized volatility
  const annualizedVolatility = ((standardDeviation / initialInvestment) * 100) / Math.sqrt(years);

  // Sharpe Ratio: (Return - Risk Free) / Volatility
  const sharpeRatio =
    annualizedVolatility > 0 ? (annualizedReturn - riskFreeRate) / annualizedVolatility : 0;

  // Sortino Ratio (only considers downside volatility)
  const downsideReturns = finalValues
    .filter((v) => v < initialInvestment)
    .map((v) => (v / initialInvestment - 1) * 100);

  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length
      : 0;
  const downsideDeviation = Math.sqrt(downsideVariance);

  const sortinoRatio =
    downsideDeviation > 0 ? (annualizedReturn - riskFreeRate) / downsideDeviation : sharpeRatio;

  // Maximum drawdown (simplified - using yearly projections)
  let maxDrawdown = 0;
  let peak = yearlyProjections[0].mean;

  for (const projection of yearlyProjections) {
    if (projection.mean > peak) {
      peak = projection.mean;
    }
    const drawdown = ((peak - projection.p10) / peak) * 100; // Use p10 for worst case
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    valueAtRisk95,
    expectedShortfall,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
  };
}

/**
 * Generate histogram data for visualization
 */
export function generateHistogramData(
  finalValues: number[],
  bins: number = 20
): { range: string; count: number; percentage: number }[] {
  const min = Math.min(...finalValues);
  const max = Math.max(...finalValues);
  const binWidth = (max - min) / bins;

  const histogram: { range: string; count: number; percentage: number }[] = [];

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    const count = finalValues.filter(
      (v) => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)
    ).length;

    histogram.push({
      range: `${(binStart / 1000).toFixed(0)}k - ${(binEnd / 1000).toFixed(0)}k`,
      count,
      percentage: (count / finalValues.length) * 100,
    });
  }

  return histogram;
}

/**
 * Run sensitivity analysis by varying one parameter
 */
export function runSensitivityAnalysis(
  baseInput: MonteCarloInput,
  parameter: keyof MonteCarloInput,
  variations: number[],
  simulations: number = 1000
): { value: number; mean: number; p10: number; p90: number }[] {
  return variations.map((value) => {
    const input = { ...baseInput, [parameter]: value, numberOfSimulations: simulations };
    const result = runMonteCarloSimulation(input);

    return {
      value,
      mean: result.mean,
      p10: result.percentiles.p10,
      p90: result.percentiles.p90,
    };
  });
}

/**
 * Quick simulation with default parameters
 */
export function quickMonteCarloSimulation(
  initialInvestment: number,
  annualCashflow: number,
  years: number = 10
): SimulationResult {
  return runMonteCarloSimulation({
    initialInvestment,
    annualCashflow,
    cashflowVariability: 10, // 10% variation
    annualAppreciation: 2.0, // 2% annual appreciation
    appreciationVariability: 5, // 5% variation
    yearsToSimulate: years,
    numberOfSimulations: 1000,
  });
}
