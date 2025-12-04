/**
 * Mortgage Rates API
 *
 * Integration layer for fetching current mortgage rates.
 * Uses mock data by default with structure for real API integration.
 */

export interface MortgageRate {
  fixedPeriod: number; // years
  interestRate: number; // percentage
  effectiveRate: number; // percentage (including fees)
  provider?: string;
  lastUpdated: Date;
}

export interface MortgageRatesResponse {
  rates: MortgageRate[];
  averageRate: number;
  trend: "STEIGEND" | "STABIL" | "FALLEND";
  lastUpdated: Date;
  source: string;
}

export interface RateTrend {
  date: Date;
  rate: number;
}

// Mock data representing typical German mortgage rates
const MOCK_RATES: MortgageRate[] = [
  {
    fixedPeriod: 5,
    interestRate: 3.2,
    effectiveRate: 3.35,
    provider: "Durchschnitt",
    lastUpdated: new Date(),
  },
  {
    fixedPeriod: 10,
    interestRate: 3.5,
    effectiveRate: 3.65,
    provider: "Durchschnitt",
    lastUpdated: new Date(),
  },
  {
    fixedPeriod: 15,
    interestRate: 3.7,
    effectiveRate: 3.85,
    provider: "Durchschnitt",
    lastUpdated: new Date(),
  },
  {
    fixedPeriod: 20,
    interestRate: 3.9,
    effectiveRate: 4.05,
    provider: "Durchschnitt",
    lastUpdated: new Date(),
  },
];

// Mock historical rate trends (last 12 months)
const generateMockTrends = (): RateTrend[] => {
  const trends: RateTrend[] = [];
  const now = new Date();
  let rate = 3.8;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    // Simulate some rate variation
    rate += (Math.random() - 0.5) * 0.2;
    rate = Math.max(2.5, Math.min(4.5, rate));
    trends.push({
      date,
      rate: Math.round(rate * 100) / 100,
    });
  }

  return trends;
};

/**
 * Fetch current mortgage rates
 * In production, this would call a real API endpoint
 */
export async function fetchMortgageRates(): Promise<MortgageRatesResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Calculate average rate
  const avgRate = MOCK_RATES.reduce((sum, r) => sum + r.interestRate, 0) / MOCK_RATES.length;

  return {
    rates: MOCK_RATES.map((rate) => ({
      ...rate,
      lastUpdated: new Date(),
    })),
    averageRate: Math.round(avgRate * 100) / 100,
    trend: "STABIL",
    lastUpdated: new Date(),
    source: "Mock Data",
  };
}

/**
 * Fetch historical rate trends
 */
export async function fetchRateTrends(): Promise<RateTrend[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return generateMockTrends();
}

/**
 * Get rate for a specific fixed period
 */
export async function getRateForPeriod(fixedPeriod: number): Promise<MortgageRate | null> {
  const response = await fetchMortgageRates();
  return response.rates.find((r) => r.fixedPeriod === fixedPeriod) || null;
}

/**
 * Calculate monthly payment for a loan
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  interestRate: number,
  repaymentRate: number
): number {
  const annuityRate = (interestRate + repaymentRate) / 100;
  return (loanAmount * annuityRate) / 12;
}

/**
 * Estimate loan affordability based on income
 */
export function estimateLoanAffordability(
  monthlyNetIncome: number,
  existingObligations: number = 0,
  maxDebtRatio: number = 35
): {
  maxMonthlyPayment: number;
  estimatedLoanAmount: number;
  interestRate: number;
} {
  const availableIncome = monthlyNetIncome - existingObligations;
  const maxMonthlyPayment = (availableIncome * maxDebtRatio) / 100;

  // Assume 3.5% interest + 2% repayment = 5.5% annual
  const annuityRate = 0.055;
  const estimatedLoanAmount = (maxMonthlyPayment * 12) / annuityRate;

  return {
    maxMonthlyPayment: Math.round(maxMonthlyPayment),
    estimatedLoanAmount: Math.round(estimatedLoanAmount / 1000) * 1000,
    interestRate: 3.5,
  };
}
