/**
 * Excel Export Generator
 *
 * Generate Excel workbooks for property investment data.
 * Uses basic CSV/JSON structure - can be enhanced with xlsx library.
 */

import type { PropertyInput, PropertyOutput, AmortizationYear, Property } from "@/types";

export interface ExcelExportData {
  property: Property;
  input: PropertyInput;
  output: PropertyOutput;
  generatedAt: Date;
}

export interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Generate overview sheet data
 */
function generateOverviewSheet(data: ExcelExportData): SheetData {
  const { property, input, output } = data;

  return {
    name: "Übersicht",
    headers: ["Kategorie", "Kennzahl", "Wert"],
    rows: [
      // Property info
      ["Objekt", "Name", property.name],
      ["Objekt", "Adresse", property.address || "-"],
      ["Objekt", "PLZ", property.postalCode || "-"],

      // Investment
      ["Investition", "Kaufpreis", input.purchasePrice],
      ["Investition", "Nebenkosten", output.investmentVolume.sideCosts.totalSideCosts],
      ["Investition", "Gesamtinvestition", output.investmentVolume.totalInvestment],
      ["Investition", "Eigenkapital", input.equity],
      ["Investition", "Finanzierungssumme", output.financing.loanAmount],

      // Financing
      ["Finanzierung", "Zinssatz (%)", input.interestRate],
      ["Finanzierung", "Tilgungsrate (%)", input.repaymentRate],
      ["Finanzierung", "Zinsbindung (Jahre)", input.fixedInterestPeriod],
      ["Finanzierung", "Monatliche Rate", output.financing.monthlyPayment],
      ["Finanzierung", "Jährliche Rate", output.financing.annualPayment],

      // Rental income
      ["Miete", "Kaltmiete IST (monatlich)", input.coldRentActual],
      ["Miete", "Kaltmiete SOLL (monatlich)", input.coldRentTarget],
      ["Miete", "Jahresmiete brutto", output.cashflow.grossRentalIncome],
      ["Miete", "Jahresmiete netto", output.cashflow.netRentalIncome],

      // Cashflow
      ["Cashflow", "Cashflow vor Steuern (jährlich)", output.cashflow.cashflowBeforeTax],
      ["Cashflow", "Steuereffekt", output.cashflow.taxEffect],
      ["Cashflow", "Cashflow nach Steuern (jährlich)", output.cashflow.cashflowAfterTax],
      ["Cashflow", "Cashflow nach Steuern (monatlich)", output.cashflow.monthlyCashflowAfterTax],

      // Yields
      ["Rendite", "Bruttomietrendite (%)", output.yields.grossRentalYield],
      ["Rendite", "Nettomietrendite (%)", output.yields.netRentalYield],
      ["Rendite", "Eigenkapitalrendite (%)", output.yields.returnOnEquity],
      ["Rendite", "Cashflow-Rendite (%)", output.yields.cashflowYield],

      // Tax
      ["Steuer", "AfA-Betrag (jährlich)", output.tax.afaAmount],
      ["Steuer", "Abzugsfähige Zinsen", output.tax.deductibleInterest],
      ["Steuer", "Abzugsfähige Kosten", output.tax.deductibleCosts],
      ["Steuer", "Gesamte Werbungskosten", output.tax.totalDeductions],
    ],
  };
}

/**
 * Generate amortization schedule sheet
 */
function generateAmortizationSheet(schedule: AmortizationYear[]): SheetData {
  return {
    name: "Tilgungsplan",
    headers: [
      "Jahr",
      "Anfangssaldo",
      "Zinsanteil",
      "Tilgungsanteil",
      "Endsaldo",
      "Kumulierte Zinsen",
      "Kumulierte Tilgung",
    ],
    rows: schedule.map((year) => [
      year.year,
      Math.round(year.startingBalance),
      Math.round(year.interestPayment),
      Math.round(year.principalPayment),
      Math.round(year.endingBalance),
      Math.round(year.cumulativeInterest),
      Math.round(year.cumulativePrincipal),
    ]),
  };
}

/**
 * Generate cashflow projection sheet
 */
function generateCashflowSheet(data: ExcelExportData): SheetData {
  const { output } = data;

  return {
    name: "Cashflow-Projektion",
    headers: ["Jahr", "Kumulierter Cashflow", "Immobilienwert", "Restschuld", "Nettovermögen"],
    rows: output.cumulativeCashflow.map((point) => [
      point.year,
      Math.round(point.cumulativeCashflow),
      Math.round(point.propertyValue),
      Math.round(point.remainingDebt),
      Math.round(point.netWorth),
    ]),
  };
}

/**
 * Generate side costs sheet
 */
function generateSideCostsSheet(data: ExcelExportData): SheetData {
  const { input, output } = data;

  return {
    name: "Nebenkosten",
    headers: ["Kostenart", "Prozent", "Betrag"],
    rows: [
      ["Maklerkosten", input.brokerPercent, output.investmentVolume.sideCosts.brokerCost],
      ["Notarkosten", input.notaryPercent, output.investmentVolume.sideCosts.notaryCost],
      [
        "Grunderwerbsteuer",
        input.propertyTransferTaxPercent,
        output.investmentVolume.sideCosts.propertyTransferTax,
      ],
      ["Renovierungskosten", 0, output.investmentVolume.sideCosts.renovationCosts],
      [
        "Gesamt",
        output.investmentVolume.sideCosts.totalSideCostsPercent,
        output.investmentVolume.sideCosts.totalSideCosts,
      ],
    ],
  };
}

/**
 * Convert sheet data to CSV format
 */
export function sheetToCSV(sheet: SheetData): string {
  const lines: string[] = [];

  // Add headers
  lines.push(sheet.headers.join(";"));

  // Add rows
  for (const row of sheet.rows) {
    const formattedRow = row.map((cell) => {
      if (typeof cell === "number") {
        return cell.toLocaleString("de-DE");
      }
      // Escape quotes and wrap in quotes if contains semicolon
      const cellStr = String(cell);
      if (cellStr.includes(";") || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    lines.push(formattedRow.join(";"));
  }

  return lines.join("\n");
}

/**
 * Generate all sheets for export
 */
export function generateAllSheets(data: ExcelExportData): SheetData[] {
  return [
    generateOverviewSheet(data),
    generateSideCostsSheet(data),
    generateAmortizationSheet(data.output.amortizationSchedule),
    generateCashflowSheet(data),
  ];
}

/**
 * Export as CSV (single sheet)
 */
export function exportAsCSV(sheet: SheetData): void {
  const csv = sheetToCSV(sheet);
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sheet.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all sheets as combined CSV
 */
export function exportAllAsCSV(data: ExcelExportData): void {
  const sheets = generateAllSheets(data);
  const combined: string[] = [];

  for (const sheet of sheets) {
    combined.push(`=== ${sheet.name.toUpperCase()} ===`);
    combined.push("");
    combined.push(sheetToCSV(sheet));
    combined.push("");
    combined.push("");
  }

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + combined.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.csv`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export as JSON (for importing into other tools)
 */
export function exportAsJSON(data: ExcelExportData): void {
  const exportData = {
    property: {
      name: data.property.name,
      address: data.property.address,
      postalCode: data.property.postalCode,
    },
    input: data.input,
    output: {
      investmentVolume: data.output.investmentVolume,
      financing: data.output.financing,
      cashflow: data.output.cashflow,
      yields: data.output.yields,
      tax: data.output.tax,
      amortizationSchedule: data.output.amortizationSchedule,
      cumulativeCashflow: data.output.cumulativeCashflow,
    },
    generatedAt: data.generatedAt.toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.json`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate summary statistics for Excel
 */
export function generateSummaryStats(data: ExcelExportData): Record<string, number | string> {
  const { input, output } = data;

  return {
    Gesamtinvestition: output.investmentVolume.totalInvestment,
    Eigenkapitalquote: `${((input.equity / output.investmentVolume.totalInvestment) * 100).toFixed(1)}%`,
    "Jährlicher Cashflow": output.cashflow.cashflowAfterTax,
    "Monatlicher Cashflow": output.cashflow.monthlyCashflowAfterTax,
    Bruttomietrendite: `${output.yields.grossRentalYield.toFixed(2)}%`,
    Nettomietrendite: `${output.yields.netRentalYield.toFixed(2)}%`,
    Eigenkapitalrendite: `${output.yields.returnOnEquity.toFixed(2)}%`,
    "Gesamte Zinskosten": output.financing.totalInterest,
    "Jahre bis Tilgung": output.amortizationSchedule.length,
  };
}
