/**
 * ImmoCalc Pro - Calculation Engine
 *
 * Core calculation logic for real estate investment analysis
 * following German tax and financial standards.
 */

import {
  PropertyInput,
  PropertyOutput,
  SideCosts,
  InvestmentVolume,
  FinancingResult,
  CashflowResult,
  YieldMetrics,
  TaxResult,
  AmortizationYear,
  CumulativeCashflowPoint,
  ExtendedCashflowPoint,
  AfARates,
} from "@/types";

// Constants
const OPERATING_COSTS_INFLATION_RATE = 0.02; // 2% annual inflation for operating costs
const DEBT_FREE_YEARS_TO_ADD = 1; // Number of debt-free years to show after complete repayment

// Reusable currency formatter for German locale
const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Calculate side costs (Nebenkosten)
 */
export function calculateSideCosts(input: PropertyInput): SideCosts {
  const brokerCost = (input.purchasePrice * input.brokerPercent) / 100;
  const notaryCost = (input.purchasePrice * input.notaryPercent) / 100;
  const propertyTransferTax = (input.purchasePrice * input.propertyTransferTaxPercent) / 100;
  const renovationCosts = input.renovationCosts;

  const totalSideCosts = brokerCost + notaryCost + propertyTransferTax + renovationCosts;
  const totalSideCostsPercent =
    input.purchasePrice > 0 ? (totalSideCosts / input.purchasePrice) * 100 : 0;

  return {
    brokerCost,
    notaryCost,
    propertyTransferTax,
    renovationCosts,
    totalSideCosts,
    totalSideCostsPercent,
  };
}

/**
 * Calculate total investment volume
 */
export function calculateInvestmentVolume(input: PropertyInput): InvestmentVolume {
  const sideCosts = calculateSideCosts(input);

  return {
    purchasePrice: input.purchasePrice,
    sideCosts,
    totalInvestment: input.purchasePrice + sideCosts.totalSideCosts,
  };
}

/**
 * Calculate financing details (annuity loan)
 */
export function calculateFinancing(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  years: number
): FinancingResult {
  if (loanAmount <= 0) {
    return {
      loanAmount: 0,
      monthlyPayment: 0,
      annualPayment: 0,
      totalCost: 0,
      totalInterest: 0,
    };
  }

  // Calculate annuity (German: Annuität = Zins + Tilgung)
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;
  const monthlyPayment = annualPayment / 12;

  // Calculate total interest over loan period using amortization simulation
  const interestRate = interestRatePercent / 100;
  let remainingBalance = loanAmount;
  let totalInterest = 0;

  for (let year = 0; year < years; year++) {
    if (remainingBalance <= 0) break;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    totalInterest += interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
  }

  const totalCost = loanAmount + totalInterest;

  return {
    loanAmount,
    monthlyPayment,
    annualPayment,
    totalCost,
    totalInterest,
  };
}

/**
 * Calculate AfA (depreciation) according to German tax law
 */
export function calculateAfA(
  purchasePrice: number,
  buildingSharePercent: number,
  afaType: PropertyInput["afaType"]
): number {
  const buildingValue = (purchasePrice * buildingSharePercent) / 100;
  const afaRate = AfARates[afaType].rate;
  return (buildingValue * afaRate) / 100;
}

/**
 * Calculate tax effects for rental property
 */
export function calculateTax(input: PropertyInput, annualInterest: number): TaxResult {
  const afaAmount = calculateAfA(input.purchasePrice, input.buildingSharePercent, input.afaType);

  // Calculate movable assets AfA (e.g., fitted kitchen)
  const movableAssetsValue = input.movableAssetsValue ?? 0;
  const movableAssetsDepreciationYears = input.movableAssetsDepreciationYears ?? 10;
  const movableAssetsAfA =
    movableAssetsValue > 0 && movableAssetsDepreciationYears > 0
      ? movableAssetsValue / movableAssetsDepreciationYears
      : 0;

  const deductibleInterest = annualInterest;
  const deductibleCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;

  // Total deductions include building AfA, movable assets AfA, interest, and costs
  const totalDeductions = afaAmount + movableAssetsAfA + deductibleInterest + deductibleCosts;
  const grossRentalIncome = input.coldRentActual * 12;
  const rentalIncomeAfterDeductions = grossRentalIncome - totalDeductions;

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

/**
 * Calculate cashflow
 */
export function calculateCashflow(
  input: PropertyInput,
  financing: FinancingResult,
  tax: TaxResult
): CashflowResult {
  const grossRentalIncome = input.coldRentActual * 12;
  const vacancyDeduction = (grossRentalIncome * input.vacancyRiskPercent) / 100;
  const netRentalIncome = grossRentalIncome - vacancyDeduction;

  const operatingCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12;
  const annualDebtService = financing.annualPayment;

  const cashflowBeforeTax = netRentalIncome - operatingCosts - annualDebtService;
  const taxEffect = tax.taxEffect;
  const cashflowAfterTax = cashflowBeforeTax + taxEffect;

  return {
    grossRentalIncome,
    vacancyDeduction,
    netRentalIncome,
    operatingCosts,
    annualDebtService,
    cashflowBeforeTax,
    taxEffect,
    cashflowAfterTax,
    monthlyCashflowBeforeTax: cashflowBeforeTax / 12,
    monthlyCashflowAfterTax: cashflowAfterTax / 12,
  };
}

/**
 * Calculate yield metrics
 */
export function calculateYields(
  input: PropertyInput,
  investment: InvestmentVolume,
  cashflow: CashflowResult
): YieldMetrics {
  const { purchasePrice, totalInvestment } = investment;
  const equity = input.equity;

  // Gross rental yield: Annual rent / Purchase price
  const grossRentalYield =
    purchasePrice > 0 ? (cashflow.grossRentalIncome / purchasePrice) * 100 : 0;

  // Net rental yield: (Net rent - operating costs) / Total investment
  const netRentalYield =
    totalInvestment > 0
      ? ((cashflow.netRentalIncome - cashflow.operatingCosts) / totalInvestment) * 100
      : 0;

  // Return on equity: Cashflow after tax / Equity
  const returnOnEquity = equity > 0 ? (cashflow.cashflowAfterTax / equity) * 100 : 0;

  // Cashflow yield: Cashflow after tax / Total investment
  const cashflowYield =
    totalInvestment > 0 ? (cashflow.cashflowAfterTax / totalInvestment) * 100 : 0;

  // Object yield (same as net rental yield for simplicity)
  const objectYield = netRentalYield;

  return {
    grossRentalYield,
    netRentalYield,
    returnOnEquity,
    cashflowYield,
    objectYield,
  };
}

/**
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  years: number
): AmortizationYear[] {
  if (loanAmount <= 0) return [];

  const schedule: AmortizationYear[] = [];
  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let year = 1; year <= years; year++) {
    if (remainingBalance <= 0) break;

    const startingBalance = remainingBalance;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;

    schedule.push({
      year,
      startingBalance,
      interestPayment,
      principalPayment,
      endingBalance: remainingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  return schedule;
}

/**
 * Calculate cumulative cashflow and net worth projection
 */
export function calculateCumulativeCashflow(
  purchasePrice: number,
  amortizationSchedule: AmortizationYear[],
  annualCashflow: number,
  annualAppreciationPercent: number = 2.0
): CumulativeCashflowPoint[] {
  if (amortizationSchedule.length === 0) return [];

  const points: CumulativeCashflowPoint[] = [];
  let cumulativeCashflow = 0;
  let propertyValue = purchasePrice;
  const appreciationRate = 1 + annualAppreciationPercent / 100;

  for (const yearData of amortizationSchedule) {
    propertyValue *= appreciationRate;
    cumulativeCashflow += annualCashflow;
    const remainingDebt = yearData.endingBalance;
    const netWorth = propertyValue - remainingDebt + cumulativeCashflow;

    points.push({
      year: yearData.year,
      cumulativeCashflow,
      propertyValue,
      remainingDebt,
      netWorth,
    });
  }

  return points;
}

/**
 * Calculate all KPIs for a property
 * This is the main entry point for the calculation engine
 */
export function calculatePropertyKPIs(input: PropertyInput): PropertyOutput {
  // 1. Calculate investment volume
  const investmentVolume = calculateInvestmentVolume(input);

  // 2. Calculate loan amount (total investment - equity)
  const loanAmount = investmentVolume.totalInvestment - input.equity;

  // 3. Calculate financing
  const financing = calculateFinancing(
    loanAmount,
    input.interestRate,
    input.repaymentRate,
    input.fixedInterestPeriod
  );

  // 4. Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    input.interestRate,
    input.repaymentRate,
    input.fixedInterestPeriod
  );

  // 5. Use Year 1 interest for tax calculation (consistent with KPI display and charts)
  const year1Interest =
    amortizationSchedule.length > 0 ? amortizationSchedule[0].interestPayment : 0;

  // 6. Calculate tax effects
  const tax = calculateTax(input, year1Interest);

  // 7. Calculate cashflow
  const cashflow = calculateCashflow(input, financing, tax);

  // 8. Calculate yields
  const yields = calculateYields(input, investmentVolume, cashflow);

  // 9. Calculate cumulative cashflow projection
  const cumulativeCashflow = calculateCumulativeCashflow(
    input.purchasePrice,
    amortizationSchedule,
    cashflow.cashflowAfterTax,
    input.expectedAppreciationPercent
  );

  return {
    investmentVolume,
    financing,
    cashflow,
    yields,
    tax,
    amortizationSchedule,
    cumulativeCashflow,
  };
}

/**
 * Get default property input values
 */
export function getDefaultPropertyInput(): PropertyInput {
  return {
    // Purchase & Costs
    purchasePrice: 300000,
    brokerPercent: 3.57,
    notaryPercent: 2.0,
    propertyTransferTaxPercent: 3.5, // Bayern
    renovationCosts: 0,

    // Family Purchase
    isFamilyPurchase: false,
    marketValue: undefined,

    // Bundesland
    bundesland: "BAYERN",

    // Financing
    equity: 60000,
    loanAmount: 0, // Calculated from totalInvestment - equity in calculatePropertyKPIs
    interestRate: 3.5,
    repaymentRate: 2.0,
    fixedInterestPeriod: 15,

    // Operations
    coldRentActual: 1000,
    coldRentTarget: 1000,
    nonRecoverableCosts: 100,
    maintenanceReserve: 50,
    vacancyRiskPercent: 2.0,

    // Tax
    personalTaxRate: 35.0,
    buildingSharePercent: 75.0,
    afaType: "ALTBAU_AB_1925",

    // Movable Assets
    movableAssetsValue: 0,
    movableAssetsDepreciationYears: 10,

    // Forecast/Prognose
    expectedAppreciationPercent: 2.0, // 2% annual appreciation
    expectedRentIncreasePercent: 1.5, // 1.5% annual rent increase
  };
}

/**
 * Calculate years until full loan repayment
 */
export function calculateYearsToFullRepayment(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number
): number {
  if (loanAmount <= 0) return 0;

  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let years = 0;
  const maxYears = 100; // Safety limit

  while (remainingBalance > 0.01 && years < maxYears) {
    years++;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
  }

  return years;
}

/**
 * Generate full amortization schedule until complete repayment
 */
export function generateFullAmortizationSchedule(
  loanAmount: number,
  interestRatePercent: number,
  repaymentRatePercent: number,
  maxYears: number = 50
): AmortizationYear[] {
  if (loanAmount <= 0) return [];

  const schedule: AmortizationYear[] = [];
  const interestRate = interestRatePercent / 100;
  const annuityRatePercent = interestRatePercent + repaymentRatePercent;
  const annualPayment = (loanAmount * annuityRatePercent) / 100;

  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let year = 1;

  while (remainingBalance > 0.01 && year <= maxYears) {
    const startingBalance = remainingBalance;
    const interestPayment = remainingBalance * interestRate;
    const principalPayment = Math.min(annualPayment - interestPayment, remainingBalance);
    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;

    schedule.push({
      year,
      startingBalance,
      interestPayment,
      principalPayment,
      endingBalance: remainingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });

    year++;
  }

  return schedule;
}

/**
 * Calculate extended cashflow projection with dynamic factors
 */
export function calculateExtendedCashflowProjection(
  input: PropertyInput,
  amortizationSchedule: AmortizationYear[],
  yearsToProject: number
): ExtendedCashflowPoint[] {
  if (amortizationSchedule.length === 0) return [];

  const points: ExtendedCashflowPoint[] = [];
  const inflationRate = OPERATING_COSTS_INFLATION_RATE;
  const rentIncreaseRate = input.expectedRentIncreasePercent / 100;
  const appreciationRate = input.expectedAppreciationPercent / 100;

  // Initial values
  let currentRent = input.coldRentActual * 12; // Annual gross rent
  let currentOperatingCosts = (input.nonRecoverableCosts + input.maintenanceReserve) * 12; // Annual operating costs
  let propertyValue = input.purchasePrice;

  const years = Math.min(yearsToProject, amortizationSchedule.length);

  // Calculate AfA (depreciation) - constant for simplified calculation
  // Note: Real estate AfA typically depends on building age, usage period, and type
  // This implementation uses a constant annual rate for simplicity
  const buildingValue = (input.purchasePrice * input.buildingSharePercent) / 100;
  const afaRate = AfARates[input.afaType].rate;
  const afaAmount = (buildingValue * afaRate) / 100;

  // Calculate movable assets AfA (e.g., fitted kitchen)
  const movableAssetsValue = input.movableAssetsValue ?? 0;
  const movableAssetsDepreciationYears = input.movableAssetsDepreciationYears ?? 10;
  const movableAssetsAfAPerYear =
    movableAssetsValue > 0 && movableAssetsDepreciationYears > 0
      ? movableAssetsValue / movableAssetsDepreciationYears
      : 0;

  for (let i = 0; i < years; i++) {
    const yearData = amortizationSchedule[i];
    const currentYear = yearData.year;

    // Apply annual increases
    if (i > 0) {
      currentRent *= 1 + rentIncreaseRate;
      currentOperatingCosts *= 1 + inflationRate;
      propertyValue *= 1 + appreciationRate;
    }

    // Calculate rent after vacancy
    const vacancyDeduction = (currentRent * input.vacancyRiskPercent) / 100;
    const netRent = currentRent - vacancyDeduction;

    // Get interest and principal from amortization schedule
    const interestPayment = yearData.interestPayment;
    const principalPayment = yearData.principalPayment;
    const remainingDebt = yearData.endingBalance;

    // Calculate movable assets AfA (only for the depreciation period)
    const currentMovableAssetsAfA =
      currentYear <= (movableAssetsDepreciationYears ?? 10) ? movableAssetsAfAPerYear : 0;

    // Calculate tax deductions (including movable assets AfA if within depreciation period)
    const totalDeductions =
      afaAmount + currentMovableAssetsAfA + interestPayment + currentOperatingCosts;
    const rentalIncomeAfterDeductions = currentRent - totalDeductions;

    // Tax effect: negative income = tax benefit, positive income = tax liability
    const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;

    // Calculate cashflow
    const cashflowBeforeTax = netRent - currentOperatingCosts - interestPayment - principalPayment;
    const cashflowAfterTax = cashflowBeforeTax + taxEffect;
    const monthlyCashflowAfterTax = cashflowAfterTax / 12;

    // Calculate equity value
    const equityValue = propertyValue - remainingDebt;

    points.push({
      year: yearData.year,
      grossRent: currentRent,
      netRent,
      interestPayment,
      principalPayment,
      operatingCosts: currentOperatingCosts,
      cashflowBeforeTax,
      cashflowAfterTax,
      monthlyCashflowAfterTax,
      remainingDebt,
      propertyValue,
      equityValue,
      afaEffect: afaAmount,
      totalTaxEffect: taxEffect,
      isDebtFree: false,
    });
  }

  // Add debt-free years after complete repayment
  for (let extraYear = 1; extraYear <= DEBT_FREE_YEARS_TO_ADD; extraYear++) {
    const year = amortizationSchedule.length + extraYear;

    // Continue to apply annual increases
    currentRent *= 1 + rentIncreaseRate;
    currentOperatingCosts *= 1 + inflationRate;
    propertyValue *= 1 + appreciationRate;

    const vacancyDeduction = (currentRent * input.vacancyRiskPercent) / 100;
    const netRent = currentRent - vacancyDeduction;

    // Calculate movable assets AfA (only for the depreciation period)
    const currentMovableAssetsAfA =
      year <= (movableAssetsDepreciationYears ?? 10) ? movableAssetsAfAPerYear : 0;

    // Calculate tax deductions (only AfA, movable assets AfA if applicable, and operating costs, no interest)
    const totalDeductions = afaAmount + currentMovableAssetsAfA + currentOperatingCosts;
    const rentalIncomeAfterDeductions = currentRent - totalDeductions;

    // Tax effect: negative income = tax benefit, positive income = tax liability
    const taxEffect = -(rentalIncomeAfterDeductions * input.personalTaxRate) / 100;

    // Cashflow without debt service
    const cashflowBeforeTax = netRent - currentOperatingCosts; // No debt service!
    const cashflowAfterTax = cashflowBeforeTax + taxEffect;
    const monthlyCashflowAfterTax = cashflowAfterTax / 12;

    points.push({
      year,
      grossRent: currentRent,
      netRent,
      interestPayment: 0, // No interest payment when debt-free
      principalPayment: 0, // No principal payment when debt-free
      operatingCosts: currentOperatingCosts,
      cashflowBeforeTax,
      cashflowAfterTax,
      monthlyCashflowAfterTax,
      remainingDebt: 0, // No remaining debt when debt-free
      propertyValue,
      equityValue: propertyValue, // Full property value = equity when debt-free
      afaEffect: afaAmount,
      totalTaxEffect: taxEffect,
      isDebtFree: true,
    });
  }

  return points;
}

// ============================================
// New Calculation Functions for Enhanced Features
// ============================================

import {
  RentIndexInput,
  RentIndexResult,
  ReferenceRentData,
  BreakEvenInput,
  BreakEvenResult,
  RenovationInput,
  RenovationResult,
  ExitStrategyInput,
  ExitStrategyResult,
  LocationAnalysisInput,
  LocationAnalysisResult,
  LocationQuality,
} from "@/types";

/**
 * Calculate rent index comparison (Mietpreisspiegel)
 */
export function calculateRentIndex(input: RentIndexInput): RentIndexResult {
  const regionData = ReferenceRentData[input.city] || ReferenceRentData.SONSTIGE;
  const currentRentPerSqm = input.livingArea > 0 ? input.currentRent / input.livingArea : 0;

  // Base market rent
  let marketRentPerSqm = regionData.avgRentPerSqm;

  // Adjustments based on property characteristics
  // Year built adjustment
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.yearBuilt;
  if (age < 5)
    marketRentPerSqm *= 1.15; // New build premium
  else if (age < 20) marketRentPerSqm *= 1.05;
  else if (age > 50) marketRentPerSqm *= 0.92;
  else if (age > 80) marketRentPerSqm *= 0.85;

  // Condition adjustment
  switch (input.condition) {
    case "SEHR_GUT":
      marketRentPerSqm *= 1.1;
      break;
    case "GUT":
      marketRentPerSqm *= 1.0;
      break;
    case "MITTEL":
      marketRentPerSqm *= 0.92;
      break;
    case "RENOVIERUNGSBEDUERFTIG":
      marketRentPerSqm *= 0.8;
      break;
  }

  // Equipment adjustment
  switch (input.equipment) {
    case "GEHOBEN":
      marketRentPerSqm *= 1.12;
      break;
    case "STANDARD":
      marketRentPerSqm *= 1.0;
      break;
    case "EINFACH":
      marketRentPerSqm *= 0.9;
      break;
  }

  // Additional features
  if (input.hasBalcony) marketRentPerSqm *= 1.03;
  if (input.hasElevator && input.floor > 2) marketRentPerSqm *= 1.02;
  if (input.floor === 0) marketRentPerSqm *= 0.97; // Ground floor discount
  if (input.floor > 4 && !input.hasElevator) marketRentPerSqm *= 0.95;

  const adjustedMarketRent = marketRentPerSqm * input.livingArea;
  const rentPotential =
    currentRentPerSqm > 0 ? ((marketRentPerSqm - currentRentPerSqm) / currentRentPerSqm) * 100 : 0;

  let recommendation: string;
  if (rentPotential > 15) {
    recommendation =
      "🟢 Erhebliches Mieterhöhungspotenzial vorhanden. Eine Mietanpassung sollte geprüft werden.";
  } else if (rentPotential > 5) {
    recommendation =
      "🟡 Moderates Mieterhöhungspotenzial. Eine schrittweise Anpassung ist möglich.";
  } else if (rentPotential > -5) {
    recommendation = "🟠 Die Miete entspricht etwa dem Marktniveau.";
  } else {
    recommendation =
      "🔴 Die aktuelle Miete liegt über dem Marktniveau. Vorsicht bei Neuvermietungen.";
  }

  return {
    currentRentPerSqm,
    marketRentPerSqm,
    marketRentRange: { min: regionData.minRent, max: regionData.maxRent },
    adjustedMarketRent,
    rentPotential,
    recommendation,
  };
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const {
    totalInvestment,
    equity,
    annualCashflow,
    annualAppreciation,
    sellingCostsPercent,
    marketValue,
    amortizationSchedule,
  } = input;

  // Use marketValue as starting point if provided, otherwise use totalInvestment
  const startValue = marketValue && marketValue > 0 ? marketValue : totalInvestment;

  // Break-even through cashflow only
  const breakEvenYearsCashflow =
    annualCashflow > 0 ? Math.ceil(totalInvestment / annualCashflow) : 999;

  // Break-even including appreciation
  let breakEvenYearsTotal = 999;
  let cumulativeReturn = 0;
  let propertyValue = startValue;

  for (let year = 1; year <= 50; year++) {
    cumulativeReturn += annualCashflow;
    propertyValue *= 1 + annualAppreciation / 100;
    const appreciation = propertyValue - startValue;
    const netAppreciation = appreciation * (1 - sellingCostsPercent / 100);

    if (cumulativeReturn + netAppreciation >= totalInvestment && breakEvenYearsTotal === 999) {
      breakEvenYearsTotal = year;
      break;
    }
  }

  // Calculate returns at specific time points
  const calculateReturnAtYear = (years: number) => {
    const cashflowTotal = annualCashflow * years;
    const futureValue = startValue * Math.pow(1 + annualAppreciation / 100, years);
    const appreciation = futureValue - startValue;
    const netAppreciation = appreciation * (1 - sellingCostsPercent / 100);

    // Calculate remaining debt if amortization schedule is provided
    const remainingDebt =
      amortizationSchedule && years <= amortizationSchedule.length
        ? amortizationSchedule[years - 1]?.endingBalance || 0
        : 0;

    const netProceeds = futureValue * (1 - sellingCostsPercent / 100) - remainingDebt;

    return {
      totalReturn: cashflowTotal + netAppreciation,
      netProceeds: netProceeds + cashflowTotal,
    };
  };

  const returnAt5Years = calculateReturnAtYear(5);
  const returnAt10Years = calculateReturnAtYear(10);
  const returnAt15Years = calculateReturnAtYear(15);

  // ROI based on equity, not total investment
  const roiAt5Years = equity > 0 ? (returnAt5Years.totalReturn / equity) * 100 : 0;
  const roiAt10Years = equity > 0 ? (returnAt10Years.totalReturn / equity) * 100 : 0;
  const roiAt15Years = equity > 0 ? (returnAt15Years.totalReturn / equity) * 100 : 0;

  // Equity Multiplier: How many times the equity has grown
  const equityMultiplierAt10Years =
    equity > 0 ? (equity + returnAt10Years.totalReturn) / equity : 0;
  const equityMultiplierAt15Years =
    equity > 0 ? (equity + returnAt15Years.totalReturn) / equity : 0;

  return {
    breakEvenYearsCashflow,
    breakEvenYearsTotal,
    totalReturnAt5Years: returnAt5Years.totalReturn,
    totalReturnAt10Years: returnAt10Years.totalReturn,
    totalReturnAt15Years: returnAt15Years.totalReturn,
    roiAt5Years,
    roiAt10Years,
    roiAt15Years,
    netProceedsAt5Years: returnAt5Years.netProceeds,
    netProceedsAt10Years: returnAt10Years.netProceeds,
    netProceedsAt15Years: returnAt15Years.netProceeds,
    equityMultiplierAt10Years,
    equityMultiplierAt15Years,
  };
}

/**
 * Calculate renovation ROI
 */
export function calculateRenovationROI(input: RenovationInput): RenovationResult {
  const {
    estimatedCost,
    expectedRentIncrease,
    expectedValueIncrease,
    financingPercent,
    interestRate,
  } = input;

  const annualRentIncrease = expectedRentIncrease * 12;

  // Calculate financing costs if applicable
  const financed = estimatedCost * (financingPercent / 100);
  const annualInterestCost = financed * (interestRate / 100);
  const netAnnualBenefit = annualRentIncrease - annualInterestCost;

  // Payback period
  const paybackPeriodYears = netAnnualBenefit > 0 ? estimatedCost / netAnnualBenefit : 999;

  // ROI from rent increase
  const roiPercent = estimatedCost > 0 ? (netAnnualBenefit / estimatedCost) * 100 : 0;

  // ROI from value increase
  const valueIncreaseRoi = estimatedCost > 0 ? (expectedValueIncrease / estimatedCost) * 100 : 0;

  // Combined assessment
  const isRecommended = paybackPeriodYears <= 10 || valueIncreaseRoi >= 100;

  let recommendation: string;
  if (paybackPeriodYears <= 5 && valueIncreaseRoi >= 100) {
    recommendation = "🟢 Sehr empfehlenswert! Schnelle Amortisation und gute Wertsteigerung.";
  } else if (paybackPeriodYears <= 8 || valueIncreaseRoi >= 80) {
    recommendation = "🟡 Empfehlenswert. Solide Investition mit gutem Potenzial.";
  } else if (paybackPeriodYears <= 12 || valueIncreaseRoi >= 50) {
    recommendation = "🟠 Bedingt empfehlenswert. Langfristige Investition.";
  } else {
    recommendation = "🔴 Nicht empfohlen. Kosten übersteigen den erwarteten Nutzen.";
  }

  return {
    totalCost: estimatedCost,
    annualRentIncrease,
    paybackPeriodYears,
    roiPercent,
    valueIncreaseRoi,
    isRecommended,
    recommendation,
  };
}

/**
 * Calculate exit strategy / selling analysis
 */
export function calculateExitStrategy(input: ExitStrategyInput): ExitStrategyResult {
  const {
    purchasePrice,
    currentValue,
    marketValue,
    holdingPeriodYears,
    remainingDebt,
    cumulativeCashflow,
    speculationTaxApplies,
    personalTaxRate,
    equity,
    totalTilgung,
  } = input;

  // Use marketValue as base if provided, otherwise use purchasePrice
  const baseValue = marketValue && marketValue > 0 ? marketValue : purchasePrice;
  const grossProfit = currentValue - baseValue;

  // Default selling costs percentage (typically 5-8% including broker, notary, etc.)
  const DEFAULT_SELLING_COSTS_PERCENT = 6;
  const sellingCosts = currentValue * (DEFAULT_SELLING_COSTS_PERCENT / 100);

  // Speculation tax (only if held less than 10 years)
  let speculationTax = 0;
  if (speculationTaxApplies && grossProfit > 0) {
    speculationTax = grossProfit * (personalTaxRate / 100);
  }

  const netProfit = grossProfit - sellingCosts - speculationTax;
  const totalReturn = netProfit + cumulativeCashflow;

  // Net proceeds after paying off remaining debt
  const netProceedsAfterDebt = currentValue - sellingCosts - speculationTax - remainingDebt;

  // Equity build-up through principal payments (Tilgung)
  const equityBuildUp = totalTilgung;

  // Return on Equity: Total return divided by initial equity
  const returnOnEquity = equity > 0 ? (totalReturn / equity) * 100 : 0;

  // Equity Multiplier: How many times the equity has grown
  const equityMultiplier = equity > 0 ? (equity + totalReturn) / equity : 0;

  // Annualized return based on equity
  const annualizedReturn =
    holdingPeriodYears > 0 && equity > 0
      ? (Math.pow((equity + totalReturn) / equity, 1 / holdingPeriodYears) - 1) * 100
      : 0;

  // Format currency for recommendation message
  const formattedTax = currencyFormatter.format(speculationTax);

  let recommendation: string;
  if (speculationTaxApplies) {
    recommendation = `⚠️ Spekulationssteuer fällt an (${formattedTax}). Ein Verkauf nach der 10-Jahres-Frist wäre steuerlich günstiger.`;
  } else if (annualizedReturn >= 8) {
    recommendation =
      "🟢 Sehr gute Rendite! Ein Verkauf kann sinnvoll sein, um Gewinne zu realisieren.";
  } else if (annualizedReturn >= 5) {
    recommendation = "🟡 Solide Rendite. Weitere Haltedauer könnte die Rendite noch verbessern.";
  } else if (annualizedReturn >= 2) {
    recommendation = "🟠 Moderate Rendite. Ein Verkauf sollte gut überlegt sein.";
  } else {
    recommendation =
      "🔴 Niedrige oder negative Rendite. Weitere Haltedauer könnte empfehlenswert sein.";
  }

  return {
    grossProfit,
    sellingCosts,
    speculationTax,
    netProfit,
    totalReturn,
    annualizedReturn,
    equityMultiplier,
    returnOnEquity,
    equityBuildUp,
    netProceedsAfterDebt,
    recommendation,
  };
}

/**
 * Calculate location analysis score
 */
export function calculateLocationAnalysis(input: LocationAnalysisInput): LocationAnalysisResult {
  let score = 50; // Base score
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Population trend (0-15 points)
  switch (input.populationTrend) {
    case "WACHSEND":
      score += 15;
      strengths.push("Wachsende Bevölkerung");
      break;
    case "STABIL":
      score += 8;
      break;
    case "SCHRUMPFEND":
      score -= 10;
      weaknesses.push("Schrumpfende Bevölkerung");
      break;
  }

  // Employment rate (0-15 points)
  switch (input.employmentRate) {
    case "HOCH":
      score += 15;
      strengths.push("Hohe Beschäftigungsrate");
      break;
    case "MITTEL":
      score += 8;
      break;
    case "NIEDRIG":
      score -= 8;
      weaknesses.push("Niedrige Beschäftigungsrate");
      break;
  }

  // Infrastructure scores (0-20 points total)
  const avgInfraScore =
    (input.infrastructureScore +
      input.publicTransportScore +
      input.shoppingScore +
      input.schoolsScore) /
    4;
  score += (avgInfraScore - 5) * 4; // -20 to +20 adjustment

  if (avgInfraScore >= 7) strengths.push("Gute Infrastruktur");
  if (avgInfraScore < 4) weaknesses.push("Schwache Infrastruktur");

  if (input.publicTransportScore >= 8) strengths.push("Sehr gute ÖPNV-Anbindung");
  if (input.publicTransportScore <= 3) weaknesses.push("Schlechte ÖPNV-Anbindung");

  // Crime rate (-15 to +10 points)
  switch (input.crimeRate) {
    case "NIEDRIG":
      score += 10;
      strengths.push("Niedrige Kriminalitätsrate");
      break;
    case "MITTEL":
      score += 0;
      break;
    case "HOCH":
      score -= 15;
      weaknesses.push("Hohe Kriminalitätsrate");
      break;
  }

  // Rental demand (0-15 points)
  switch (input.rentalDemand) {
    case "SEHR_HOCH":
      score += 15;
      strengths.push("Sehr hohe Mietnachfrage");
      break;
    case "HOCH":
      score += 10;
      strengths.push("Hohe Mietnachfrage");
      break;
    case "MITTEL":
      score += 5;
      break;
    case "NIEDRIG":
      score -= 10;
      weaknesses.push("Niedrige Mietnachfrage");
      break;
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine location quality
  let locationQuality: LocationQuality;
  if (score >= 80) locationQuality = "A";
  else if (score >= 60) locationQuality = "B";
  else if (score >= 40) locationQuality = "C";
  else locationQuality = "D";

  // Investment recommendation
  let investmentRecommendation: LocationAnalysisResult["investmentRecommendation"];
  if (score >= 75) investmentRecommendation = "STARK_EMPFOHLEN";
  else if (score >= 55) investmentRecommendation = "EMPFOHLEN";
  else if (score >= 35) investmentRecommendation = "NEUTRAL";
  else investmentRecommendation = "NICHT_EMPFOHLEN";

  // Risk level
  let riskLevel: LocationAnalysisResult["riskLevel"];
  if (score >= 65) riskLevel = "NIEDRIG";
  else if (score >= 40) riskLevel = "MITTEL";
  else riskLevel = "HOCH";

  return {
    overallScore: Math.round(score),
    locationQuality,
    investmentRecommendation,
    strengths,
    weaknesses,
    riskLevel,
  };
}

// ============================================
// Utility Functions for Charts
// ============================================

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
