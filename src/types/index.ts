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

  // Family Purchase
  isFamilyPurchase: boolean;
  marketValue?: number;

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

export const PropertyTypeLabels: Record<PropertyType, string> = {
  WOHNUNG: "Wohnung",
  EINFAMILIENHAUS: "Einfamilienhaus",
  MEHRFAMILIENHAUS: "Mehrfamilienhaus",
  GEWERBE: "Gewerbe",
  MISCHNUTZUNG: "Mischnutzung",
};

/**
 * Reference rent data by region (Mietpreisspiegel)
 * Sample data for major German cities - average cold rent per sqm
 */
export const ReferenceRentData: Record<
  string,
  { city: string; avgRentPerSqm: number; minRent: number; maxRent: number }
> = {
  MUENCHEN: { city: "München", avgRentPerSqm: 19.5, minRent: 14.0, maxRent: 28.0 },
  FRANKFURT: { city: "Frankfurt am Main", avgRentPerSqm: 16.5, minRent: 12.0, maxRent: 24.0 },
  STUTTGART: { city: "Stuttgart", avgRentPerSqm: 15.0, minRent: 11.0, maxRent: 22.0 },
  BERLIN: { city: "Berlin", avgRentPerSqm: 14.0, minRent: 9.0, maxRent: 20.0 },
  HAMBURG: { city: "Hamburg", avgRentPerSqm: 14.5, minRent: 10.0, maxRent: 21.0 },
  DUESSELDORF: { city: "Düsseldorf", avgRentPerSqm: 13.5, minRent: 10.0, maxRent: 19.0 },
  KOELN: { city: "Köln", avgRentPerSqm: 13.0, minRent: 9.5, maxRent: 18.0 },
  NUERNBERG: { city: "Nürnberg", avgRentPerSqm: 11.5, minRent: 8.5, maxRent: 16.0 },
  HANNOVER: { city: "Hannover", avgRentPerSqm: 10.5, minRent: 7.5, maxRent: 15.0 },
  LEIPZIG: { city: "Leipzig", avgRentPerSqm: 8.5, minRent: 6.0, maxRent: 12.0 },
  DRESDEN: { city: "Dresden", avgRentPerSqm: 9.0, minRent: 6.5, maxRent: 13.0 },
  DORTMUND: { city: "Dortmund", avgRentPerSqm: 9.0, minRent: 6.5, maxRent: 13.0 },
  ESSEN: { city: "Essen", avgRentPerSqm: 8.5, minRent: 6.0, maxRent: 12.0 },
  SONSTIGE: { city: "Sonstige / Ländlich", avgRentPerSqm: 7.5, minRent: 5.0, maxRent: 11.0 },
};

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
  annualCashflow: number;
  annualAppreciation: number; // percentage
  sellingCostsPercent: number; // typically 5-10%
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
  roiAt5Years: number;
  roiAt10Years: number;
  roiAt15Years: number;
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

export const RenovationTypeLabels: Record<
  RenovationInput["renovationType"],
  { label: string; typicalCost: string; typicalRentIncrease: string }
> = {
  BAEDER: {
    label: "Badezimmer",
    typicalCost: "8.000 - 25.000 €",
    typicalRentIncrease: "50 - 150 €/Monat",
  },
  KUECHE: {
    label: "Küche",
    typicalCost: "5.000 - 20.000 €",
    typicalRentIncrease: "30 - 100 €/Monat",
  },
  BOEDEN: {
    label: "Böden",
    typicalCost: "3.000 - 12.000 €",
    typicalRentIncrease: "20 - 60 €/Monat",
  },
  FENSTER: {
    label: "Fenster",
    typicalCost: "5.000 - 15.000 €",
    typicalRentIncrease: "30 - 80 €/Monat",
  },
  FASSADE: {
    label: "Fassade/Dämmung",
    typicalCost: "15.000 - 50.000 €",
    typicalRentIncrease: "50 - 150 €/Monat",
  },
  HEIZUNG: {
    label: "Heizung",
    typicalCost: "8.000 - 25.000 €",
    typicalRentIncrease: "40 - 100 €/Monat",
  },
  DACH: { label: "Dach", typicalCost: "15.000 - 40.000 €", typicalRentIncrease: "30 - 80 €/Monat" },
  ELEKTRIK: {
    label: "Elektrik",
    typicalCost: "3.000 - 10.000 €",
    typicalRentIncrease: "20 - 50 €/Monat",
  },
  SONSTIGE: { label: "Sonstige", typicalCost: "variabel", typicalRentIncrease: "variabel" },
};

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
  holdingPeriodYears: number;
  remainingDebt: number;
  cumulativeCashflow: number;
  speculationTaxApplies: boolean; // true if held < 10 years
  personalTaxRate: number;
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
 * Default due diligence checklist items
 */
export const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, "isCompleted" | "notes">[] = [
  // Documents
  {
    id: "doc-1",
    category: "DOKUMENTE",
    title: "Grundbuchauszug",
    description: "Aktueller Grundbuchauszug (max. 3 Monate alt)",
    isRequired: true,
  },
  {
    id: "doc-2",
    category: "DOKUMENTE",
    title: "Energieausweis",
    description: "Gültiger Energieausweis nach EnEV",
    isRequired: true,
  },
  {
    id: "doc-3",
    category: "DOKUMENTE",
    title: "Teilungserklärung",
    description: "Bei Eigentumswohnungen erforderlich",
    isRequired: false,
  },
  {
    id: "doc-4",
    category: "DOKUMENTE",
    title: "Protokolle Eigentümerversammlung",
    description: "Letzte 3 Jahre",
    isRequired: false,
  },
  {
    id: "doc-5",
    category: "DOKUMENTE",
    title: "Nebenkostenabrechnung",
    description: "Letzte 2-3 Jahre",
    isRequired: true,
  },
  {
    id: "doc-6",
    category: "DOKUMENTE",
    title: "Mietvertrag",
    description: "Aktuelle Mietverträge aller Einheiten",
    isRequired: true,
  },
  {
    id: "doc-7",
    category: "DOKUMENTE",
    title: "Wirtschaftsplan",
    description: "Aktueller WEG-Wirtschaftsplan",
    isRequired: false,
  },
  {
    id: "doc-8",
    category: "DOKUMENTE",
    title: "Baugenehmigung",
    description: "Original-Baugenehmigung und Änderungen",
    isRequired: false,
  },

  // Inspection
  {
    id: "bes-1",
    category: "BESICHTIGUNG",
    title: "Außenbesichtigung",
    description: "Fassade, Dach, Fenster, Außenanlagen",
    isRequired: true,
  },
  {
    id: "bes-2",
    category: "BESICHTIGUNG",
    title: "Innenbesichtigung",
    description: "Alle Räume, Keller, Dachboden",
    isRequired: true,
  },
  {
    id: "bes-3",
    category: "BESICHTIGUNG",
    title: "Haustechnik prüfen",
    description: "Heizung, Elektrik, Wasserleitungen",
    isRequired: true,
  },
  {
    id: "bes-4",
    category: "BESICHTIGUNG",
    title: "Feuchtigkeitsschäden",
    description: "Keller, Bäder, Fensteranschlüsse prüfen",
    isRequired: true,
  },
  {
    id: "bes-5",
    category: "BESICHTIGUNG",
    title: "Umgebung erkunden",
    description: "Infrastruktur, Nachbarschaft, Lärm",
    isRequired: true,
  },

  // Finances
  {
    id: "fin-1",
    category: "FINANZEN",
    title: "Kaufpreisverhandlung",
    description: "Marktvergleich, Verhandlungsspielraum",
    isRequired: true,
  },
  {
    id: "fin-2",
    category: "FINANZEN",
    title: "Finanzierungszusage",
    description: "Schriftliche Bankzusage einholen",
    isRequired: true,
  },
  {
    id: "fin-3",
    category: "FINANZEN",
    title: "Renditeberechnung",
    description: "Vollständige Kalkulation durchführen",
    isRequired: true,
  },
  {
    id: "fin-4",
    category: "FINANZEN",
    title: "Rücklagenprüfung",
    description: "WEG-Rücklagen und Instandhaltung",
    isRequired: false,
  },
  {
    id: "fin-5",
    category: "FINANZEN",
    title: "Mietpotenzial",
    description: "Mietpreisspiegel und Erhöhungspotenzial",
    isRequired: true,
  },

  // Legal
  {
    id: "rec-1",
    category: "RECHTLICHES",
    title: "Kaufvertragsentwurf",
    description: "Vom Notar prüfen lassen",
    isRequired: true,
  },
  {
    id: "rec-2",
    category: "RECHTLICHES",
    title: "Grunddienstbarkeiten",
    description: "Wegerechte, Leitungsrechte prüfen",
    isRequired: true,
  },
  {
    id: "rec-3",
    category: "RECHTLICHES",
    title: "Baulastenverzeichnis",
    description: "Bei der Gemeinde abfragen",
    isRequired: true,
  },
  {
    id: "rec-4",
    category: "RECHTLICHES",
    title: "Denkmalschutz",
    description: "Status und Auflagen klären",
    isRequired: false,
  },
  {
    id: "rec-5",
    category: "RECHTLICHES",
    title: "Mietverhältnisse",
    description: "Kündigungsfristen, Mieterhöhungen prüfen",
    isRequired: true,
  },

  // Technical
  {
    id: "tec-1",
    category: "TECHNISCH",
    title: "Baujahr und Bausubstanz",
    description: "Alter und Zustand der Substanz",
    isRequired: true,
  },
  {
    id: "tec-2",
    category: "TECHNISCH",
    title: "Heizungsanlage",
    description: "Alter, Effizienz, Wartungszustand",
    isRequired: true,
  },
  {
    id: "tec-3",
    category: "TECHNISCH",
    title: "Elektroinstallation",
    description: "Alter, Zustand, Modernisierungsbedarf",
    isRequired: true,
  },
  {
    id: "tec-4",
    category: "TECHNISCH",
    title: "Dachzustand",
    description: "Letzte Sanierung, Zustand",
    isRequired: true,
  },
  {
    id: "tec-5",
    category: "TECHNISCH",
    title: "Sanitärinstallationen",
    description: "Alter und Zustand der Leitungen",
    isRequired: true,
  },
  {
    id: "tec-6",
    category: "TECHNISCH",
    title: "Gutachter beauftragen",
    description: "Bei Bedarf Sachverständigen einschalten",
    isRequired: false,
  },
];
