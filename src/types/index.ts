/**
 * Types for ImmoCalc Pro - Real Estate Investment Calculator
 *
 * Pure type definitions. Data constants are in src/data/.
 * Re-exports provided for backward compatibility.
 */

// Re-export data constants for backward compatibility
export { AfARates } from "@/data/afa-rates";
export { BundeslandData } from "@/data/bundesland";
export { ReferenceRentData, PropertyTypeLabels, RenovationTypeLabels } from "@/data/reference-data";
export { DEFAULT_CHECKLIST_ITEMS } from "@/data/checklist-items";

/**
 * AfA types according to German tax law (§ 7 EStG)
 */
export type AfAType = "ALTBAU_VOR_1925" | "ALTBAU_AB_1925" | "NEUBAU_AB_2023" | "DENKMALSCHUTZ";

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

  // Family Purchase
  isFamilyPurchase: boolean;
  marketValue?: number;

  // Bundesland - stores the actual selected Bundesland
  bundesland?: Bundesland;

  // Financing
  equity: number;
  loanAmount?: number;
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

  // Movable Assets / Fitted Kitchen
  movableAssetsValue?: number; // Value of movable assets (e.g., fitted kitchen) in €
  movableAssetsDepreciationYears?: number; // Depreciation period in years (default: 10)

  // Forecast/Prognose
  expectedAppreciationPercent: number; // Expected annual property value increase
  expectedRentIncreasePercent: number; // Expected annual rent increase
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
 * Investment return metrics derived from the full projected cashflow stream.
 *
 * Unlike the point-in-time {@link YieldMetrics}, these are time-weighted
 * measures that account for equity invested at t0, every projected after-tax
 * cashflow, and the equity recovered on exit (sale proceeds net of remaining
 * debt). They answer "what did the investment actually earn per year".
 */
export interface InvestmentReturns {
  /** Exit year used for the terminal value (end of the analysed horizon). */
  exitYear: number;
  /** Equity invested at t0 (down payment + purchase side costs financed by equity). */
  initialEquity: number;
  /** Sum of all projected after-tax cashflows over the horizon (excl. sale). */
  totalCashflow: number;
  /** Property value at exit after compound appreciation. */
  exitPropertyValue: number;
  /** Remaining loan balance at exit. */
  exitRemainingDebt: number;
  /** Net sale proceeds at exit: value − selling costs − speculation tax − debt. */
  exitNetProceeds: number;
  /** Total profit: cumulative cashflow + net proceeds − initial equity. */
  totalProfit: number;
  /** Equity multiplier: (initial equity + total profit) / initial equity. */
  equityMultiplier: number;
  /**
   * After-tax internal rate of return (%) of the equity cashflow stream.
   * Returns `null` when no sign change makes an IRR undefined
   * (e.g. all-negative or all-positive flows).
   */
  irr: number | null;
  /** Simple annualised return (%) derived from the equity multiplier. */
  annualizedReturn: number;
}

/**
 * Tax calculation result
 */
export interface TaxResult {
  afaAmount: number;
  movableAssetsAfA?: number; // Separate movable assets depreciation
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
 * Extended cashflow data point with detailed breakdown
 */
export interface ExtendedCashflowPoint {
  year: number;
  // Income
  grossRent: number;
  netRent: number;

  // Expenses
  interestPayment: number;
  principalPayment: number;
  operatingCosts: number;

  // Cashflow
  cashflowBeforeTax: number;
  cashflowAfterTax: number;
  monthlyCashflowAfterTax: number;

  // Assets
  remainingDebt: number;
  propertyValue: number;
  equityValue: number;

  // Tax
  afaEffect: number;
  totalTaxEffect: number;

  // Debt status
  isDebtFree?: boolean;
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
  /**
   * Time-weighted investment returns (after-tax IRR, total return, equity
   * multiplier) over the default holding period. Optional so existing
   * consumers and serialized outputs remain backward compatible.
   */
  investmentReturns?: InvestmentReturns;
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

// ============================================
// New Feature Types for Enhanced Tool
// ============================================

/**
 * Location quality ratings for location analysis
 */
export type LocationQuality = "A" | "B" | "C" | "D";

/**
 * Property type categories
 */
export type PropertyType =
  | "WOHNUNG"
  | "EINFAMILIENHAUS"
  | "MEHRFAMILIENHAUS"
  | "GEWERBE"
  | "MISCHNUTZUNG";

/**
 * Rent Index / Mietpreisspiegel input
 */
export interface RentIndexInput {
  city: string;
  livingArea: number; // sqm
  currentRent: number; // monthly cold rent
  yearBuilt: number;
  condition: "SEHR_GUT" | "GUT" | "MITTEL" | "RENOVIERUNGSBEDUERFTIG";
  equipment: "GEHOBEN" | "STANDARD" | "EINFACH";
  hasBalcony: boolean;
  hasElevator: boolean;
  floor: number;
}

/**
 * Rent Index / Mietpreisspiegel result
 */
export interface RentIndexResult {
  currentRentPerSqm: number;
  marketRentPerSqm: number;
  marketRentRange: { min: number; max: number };
  adjustedMarketRent: number; // monthly
  rentPotential: number; // percentage difference
  recommendation: string;
}

/**
 * Break-even calculation input
 */
export interface BreakEvenInput {
  totalInvestment: number;
  equity: number; // Initial equity for ROI calculation
  annualCashflow: number;
  annualAppreciation: number; // percentage
  sellingCostsPercent: number; // typically 5-10%
  marketValue?: number; // Optional market value as starting point
  amortizationSchedule?: AmortizationYear[]; // For calculating remaining debt
}

/**
 * Break-even calculation result
 */
export interface BreakEvenResult {
  breakEvenYearsCashflow: number; // years until cumulative cashflow covers investment
  breakEvenYearsTotal: number; // years until total return (incl. appreciation) covers investment
  totalReturnAt5Years: number;
  totalReturnAt10Years: number;
  totalReturnAt15Years: number;
  roiAt5Years: number; // ROI based on equity
  roiAt10Years: number;
  roiAt15Years: number;
  netProceedsAt5Years: number; // Net proceeds after remaining debt
  netProceedsAt10Years: number;
  netProceedsAt15Years: number;
  equityMultiplierAt10Years: number; // How many times equity was multiplied
  equityMultiplierAt15Years: number;
}

/**
 * Renovation ROI input
 */
export interface RenovationInput {
  renovationType:
    | "BAEDER"
    | "KUECHE"
    | "BOEDEN"
    | "FENSTER"
    | "FASSADE"
    | "HEIZUNG"
    | "DACH"
    | "ELEKTRIK"
    | "SONSTIGE";
  estimatedCost: number;
  expectedRentIncrease: number; // monthly
  expectedValueIncrease: number;
  financingPercent: number; // percentage financed
  interestRate: number;
}

/**
 * Renovation ROI result
 */
export interface RenovationResult {
  totalCost: number;
  annualRentIncrease: number;
  paybackPeriodYears: number;
  roiPercent: number;
  valueIncreaseRoi: number;
  isRecommended: boolean;
  recommendation: string;
}

/**
 * Exit strategy / selling calculation input
 */
export interface ExitStrategyInput {
  purchasePrice: number;
  currentValue: number;
  marketValue?: number; // Optional market value as base for calculation
  holdingPeriodYears: number;
  remainingDebt: number;
  cumulativeCashflow: number;
  speculationTaxApplies: boolean; // true if held < 10 years
  personalTaxRate: number;
  equity: number; // Initial equity invested
  totalTilgung: number; // Total principal paid over holding period
}

/**
 * Exit strategy / selling calculation result
 */
export interface ExitStrategyResult {
  grossProfit: number;
  sellingCosts: number; // broker, notary, etc.
  speculationTax: number;
  netProfit: number;
  totalReturn: number; // including cashflow
  annualizedReturn: number;
  equityMultiplier: number; // How many times equity was multiplied (e.g., 3.0x)
  returnOnEquity: number; // ROI based on equity (percentage)
  equityBuildUp: number; // Equity built through principal payments
  netProceedsAfterDebt: number; // Net proceeds after paying off remaining debt
  recommendation: string;
}

/**
 * Due diligence checklist item
 */
export interface ChecklistItem {
  id: string;
  category: "DOKUMENTE" | "BESICHTIGUNG" | "FINANZEN" | "RECHTLICHES" | "TECHNISCH";
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  notes?: string;
}

/**
 * Location analysis input
 */
export interface LocationAnalysisInput {
  city: string;
  district?: string;
  populationTrend: "WACHSEND" | "STABIL" | "SCHRUMPFEND";
  employmentRate: "HOCH" | "MITTEL" | "NIEDRIG";
  infrastructureScore: number; // 1-10
  publicTransportScore: number; // 1-10
  shoppingScore: number; // 1-10
  schoolsScore: number; // 1-10
  crimeRate: "NIEDRIG" | "MITTEL" | "HOCH";
  rentalDemand: "SEHR_HOCH" | "HOCH" | "MITTEL" | "NIEDRIG";
}

/**
 * Location analysis result
 */
export interface LocationAnalysisResult {
  overallScore: number; // 1-100
  locationQuality: LocationQuality;
  investmentRecommendation: "STARK_EMPFOHLEN" | "EMPFOHLEN" | "NEUTRAL" | "NICHT_EMPFOHLEN";
  strengths: string[];
  weaknesses: string[];
  riskLevel: "NIEDRIG" | "MITTEL" | "HOCH";
}

/**
 * Extended location data with coordinates
 */
export interface LocationData {
  postalCode: string;
  city: string;
  district?: string;
  state: string;
  bundesland: Bundesland;
  latitude: number;
  longitude: number;
}

/**
 * Extended rent data with population
 */
export interface CityRentData {
  city: string;
  avgRentPerSqm: number;
  minRent: number;
  maxRent: number;
  population?: number;
}

// End of type definitions
