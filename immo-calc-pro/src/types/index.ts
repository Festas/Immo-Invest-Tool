/**
 * Types for ImmoCalc Pro - Real Estate Investment Calculator
 */

/**
 * AfA types according to German tax law (§ 7 EStG)
 */
export type AfAType = "ALTBAU_VOR_1925" | "ALTBAU_AB_1925" | "NEUBAU_AB_2023" | "DENKMALSCHUTZ";

export const AfARates: Record<AfAType, { rate: number; label: string }> = {
  ALTBAU_VOR_1925: { rate: 2.5, label: "Altbau vor 1925 (2,5%)" },
  ALTBAU_AB_1925: { rate: 2.0, label: "Altbau ab 1925 (2%)" },
  NEUBAU_AB_2023: { rate: 3.0, label: "Neubau ab 2023 (3%)" },
  DENKMALSCHUTZ: { rate: 9.0, label: "Denkmalschutz (9%)" },
};

/**
 * German federal states with property transfer tax rates (2024)
 */
export type Bundesland =
  | "BADEN_WUERTTEMBERG"
  | "BAYERN"
  | "BERLIN"
  | "BRANDENBURG"
  | "BREMEN"
  | "HAMBURG"
  | "HESSEN"
  | "MECKLENBURG_VORPOMMERN"
  | "NIEDERSACHSEN"
  | "NORDRHEIN_WESTFALEN"
  | "RHEINLAND_PFALZ"
  | "SAARLAND"
  | "SACHSEN"
  | "SACHSEN_ANHALT"
  | "SCHLESWIG_HOLSTEIN"
  | "THUERINGEN";

export const BundeslandData: Record<Bundesland, { name: string; taxRate: number }> = {
  BADEN_WUERTTEMBERG: { name: "Baden-Württemberg", taxRate: 5.0 },
  BAYERN: { name: "Bayern", taxRate: 3.5 },
  BERLIN: { name: "Berlin", taxRate: 6.0 },
  BRANDENBURG: { name: "Brandenburg", taxRate: 6.5 },
  BREMEN: { name: "Bremen", taxRate: 5.0 },
  HAMBURG: { name: "Hamburg", taxRate: 5.5 },
  HESSEN: { name: "Hessen", taxRate: 6.0 },
  MECKLENBURG_VORPOMMERN: { name: "Mecklenburg-Vorpommern", taxRate: 6.0 },
  NIEDERSACHSEN: { name: "Niedersachsen", taxRate: 5.0 },
  NORDRHEIN_WESTFALEN: { name: "Nordrhein-Westfalen", taxRate: 6.5 },
  RHEINLAND_PFALZ: { name: "Rheinland-Pfalz", taxRate: 5.0 },
  SAARLAND: { name: "Saarland", taxRate: 6.5 },
  SACHSEN: { name: "Sachsen", taxRate: 5.5 },
  SACHSEN_ANHALT: { name: "Sachsen-Anhalt", taxRate: 5.0 },
  SCHLESWIG_HOLSTEIN: { name: "Schleswig-Holstein", taxRate: 6.5 },
  THUERINGEN: { name: "Thüringen", taxRate: 5.0 },
};

/**
 * Property input data structure
 */
export interface PropertyInput {
  // Purchase & Costs
  purchasePrice: number;
  brokerPercent: number;
  notaryPercent: number;
  propertyTransferTaxPercent: number;
  renovationCosts: number;

  // Financing
  equity: number;
  loanAmount: number;
  interestRate: number;
  repaymentRate: number;
  fixedInterestPeriod: number;

  // Operations
  coldRentActual: number;
  coldRentTarget: number;
  nonRecoverableCosts: number;
  maintenanceReserve: number;
  vacancyRiskPercent: number;

  // Tax
  personalTaxRate: number;
  buildingSharePercent: number;
  afaType: AfAType;
}

/**
 * Side costs breakdown
 */
export interface SideCosts {
  brokerCost: number;
  notaryCost: number;
  propertyTransferTax: number;
  renovationCosts: number;
  totalSideCosts: number;
  totalSideCostsPercent: number;
}

/**
 * Investment volume calculation
 */
export interface InvestmentVolume {
  purchasePrice: number;
  sideCosts: SideCosts;
  totalInvestment: number;
}

/**
 * Financing calculation result
 */
export interface FinancingResult {
  loanAmount: number;
  monthlyPayment: number;
  annualPayment: number;
  totalCost: number;
  totalInterest: number;
}

/**
 * Cashflow calculation result
 */
export interface CashflowResult {
  grossRentalIncome: number;
  vacancyDeduction: number;
  netRentalIncome: number;
  operatingCosts: number;
  annualDebtService: number;
  cashflowBeforeTax: number;
  taxEffect: number;
  cashflowAfterTax: number;
  monthlyCashflowBeforeTax: number;
  monthlyCashflowAfterTax: number;
}

/**
 * Yield metrics calculation result
 */
export interface YieldMetrics {
  grossRentalYield: number;
  netRentalYield: number;
  returnOnEquity: number;
  cashflowYield: number;
  objectYield: number;
}

/**
 * Tax calculation result
 */
export interface TaxResult {
  afaAmount: number;
  deductibleInterest: number;
  deductibleCosts: number;
  totalDeductions: number;
  rentalIncomeAfterDeductions: number;
  taxEffect: number;
  monthlyTaxEffect: number;
}

/**
 * Single year in amortization schedule
 */
export interface AmortizationYear {
  year: number;
  startingBalance: number;
  interestPayment: number;
  principalPayment: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

/**
 * Cumulative cashflow data point
 */
export interface CumulativeCashflowPoint {
  year: number;
  cumulativeCashflow: number;
  propertyValue: number;
  remainingDebt: number;
  netWorth: number;
}

/**
 * Complete property calculation output
 */
export interface PropertyOutput {
  investmentVolume: InvestmentVolume;
  financing: FinancingResult;
  cashflow: CashflowResult;
  yields: YieldMetrics;
  tax: TaxResult;
  amortizationSchedule: AmortizationYear[];
  cumulativeCashflow: CumulativeCashflowPoint[];
}

/**
 * Stored property with metadata
 */
export interface Property {
  id: string;
  name: string;
  address?: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
  input: PropertyInput;
  output?: PropertyOutput;
}

/**
 * Portfolio overview
 */
export interface PortfolioSummary {
  totalProperties: number;
  totalInvestment: number;
  totalEquity: number;
  totalDebt: number;
  totalMonthlyCashflow: number;
  totalAnnualCashflow: number;
  averageYield: number;
}

/**
 * Scenario for comparison
 */
export interface Scenario {
  id: string;
  name: string;
  input: PropertyInput;
  output?: PropertyOutput;
}
