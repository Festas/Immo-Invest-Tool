/**
 * Excel Export Generator
 *
 * Generate native .xlsx workbooks for property investment data using ExcelJS.
 */

import ExcelJS from "exceljs";
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
 * Brand colors for Excel
 */
const EXCEL_COLORS = {
  primary: "2563EB",
  primaryDark: "1E40AF",
  white: "FFFFFF",
  lightBg: "F0F9FF",
  positive: "16A34A",
  negative: "DC2626",
  headerText: "FFFFFF",
};

/**
 * Format currency for German locale
 */
function fmtCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
function fmtPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Apply header styling to a row
 */
function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_COLORS.primary },
    };
    cell.font = { bold: true, color: { argb: EXCEL_COLORS.headerText }, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thin", color: { argb: EXCEL_COLORS.primaryDark } },
    };
  });
  row.height = 22;
}

/**
 * Apply data row styling with alternating colors
 */
function styleDataRow(row: ExcelJS.Row, isEven: boolean): void {
  row.eachCell((cell) => {
    if (isEven) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: EXCEL_COLORS.lightBg },
      };
    }
    cell.alignment = { vertical: "middle" };
    cell.border = {
      bottom: { style: "hair", color: { argb: "DDDDDD" } },
    };
  });
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
 * Convert sheet data to CSV format (kept for backward compatibility)
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
 * Export as CSV (single sheet) - kept for backward compatibility
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
 * Export all sheets as combined CSV - kept for backward compatibility
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
 * Export as JSON (for importing into other tools) - kept for backward compatibility
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

// ============================================
// Native Excel (.xlsx) Export using ExcelJS
// ============================================

/**
 * Build an ExcelJS workbook from export data
 */
export async function buildExcelWorkbook(data: ExcelExportData): Promise<ExcelJS.Workbook> {
  const { property, input, output } = data;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ImmoCalc Pro";
  workbook.created = data.generatedAt;

  // --- Sheet 1: Overview ---
  const overviewSheet = workbook.addWorksheet("Übersicht", {
    properties: { tabColor: { argb: EXCEL_COLORS.primary } },
  });

  // Title row
  overviewSheet.mergeCells("A1:C1");
  const titleCell = overviewSheet.getCell("A1");
  titleCell.value = `Immobilien-Investitionsanalyse: ${property.name}`;
  titleCell.font = { bold: true, size: 16, color: { argb: EXCEL_COLORS.primary } };
  titleCell.alignment = { horizontal: "left" };
  overviewSheet.getRow(1).height = 30;

  // Metadata
  overviewSheet.getCell("A2").value = `Adresse: ${property.address || "Nicht angegeben"}`;
  overviewSheet.getCell("A3").value =
    `Erstellt am: ${data.generatedAt.toLocaleDateString("de-DE")}`;
  overviewSheet.getRow(2).font = { italic: true, color: { argb: "666666" } };
  overviewSheet.getRow(3).font = { italic: true, color: { argb: "666666" } };

  // Column widths
  overviewSheet.getColumn(1).width = 20;
  overviewSheet.getColumn(2).width = 35;
  overviewSheet.getColumn(3).width = 25;

  // Header row
  const overviewHeaderRow = overviewSheet.getRow(5);
  overviewHeaderRow.values = ["Kategorie", "Kennzahl", "Wert"];
  styleHeaderRow(overviewHeaderRow);

  // Data
  const overviewData = generateOverviewSheet(data);
  overviewData.rows.forEach((row, index) => {
    const excelRow = overviewSheet.getRow(6 + index);
    excelRow.values = [row[0], row[1], row[2]];

    // Format currency cells
    const val = row[2];
    if (typeof val === "number" && Math.abs(val) >= 1) {
      excelRow.getCell(3).numFmt = '#,##0 "€"';
    }

    styleDataRow(excelRow, index % 2 === 0);
  });

  // --- Sheet 2: Side Costs ---
  const sideCostsSheet = workbook.addWorksheet("Nebenkosten", {
    properties: { tabColor: { argb: EXCEL_COLORS.primary } },
  });

  sideCostsSheet.getColumn(1).width = 25;
  sideCostsSheet.getColumn(2).width = 15;
  sideCostsSheet.getColumn(3).width = 20;

  const scHeaderRow = sideCostsSheet.getRow(1);
  scHeaderRow.values = ["Kostenart", "Prozent", "Betrag"];
  styleHeaderRow(scHeaderRow);

  const scData = generateSideCostsSheet(data);
  scData.rows.forEach((row, index) => {
    const excelRow = sideCostsSheet.getRow(2 + index);
    excelRow.values = [row[0], row[1], row[2]];
    excelRow.getCell(2).numFmt = "0.00%";
    if (typeof row[1] === "number") {
      excelRow.getCell(2).value = row[1] / 100;
    }
    excelRow.getCell(3).numFmt = '#,##0 "€"';
    styleDataRow(excelRow, index % 2 === 0);

    // Bold the total row
    if (row[0] === "Gesamt") {
      excelRow.font = { bold: true };
    }
  });

  // --- Sheet 3: Amortization Schedule ---
  const amortSheet = workbook.addWorksheet("Tilgungsplan", {
    properties: { tabColor: { argb: EXCEL_COLORS.primary } },
  });

  const amortHeaders = [
    "Jahr",
    "Anfangssaldo",
    "Zinsen",
    "Tilgung",
    "Endsaldo",
    "Kum. Zinsen",
    "Kum. Tilgung",
  ];
  amortSheet.getColumn(1).width = 8;
  for (let i = 2; i <= 7; i++) {
    amortSheet.getColumn(i).width = 18;
  }

  const amortHeaderRow = amortSheet.getRow(1);
  amortHeaderRow.values = amortHeaders;
  styleHeaderRow(amortHeaderRow);

  output.amortizationSchedule.forEach((year, index) => {
    const excelRow = amortSheet.getRow(2 + index);
    excelRow.values = [
      year.year,
      Math.round(year.startingBalance),
      Math.round(year.interestPayment),
      Math.round(year.principalPayment),
      Math.round(year.endingBalance),
      Math.round(year.cumulativeInterest),
      Math.round(year.cumulativePrincipal),
    ];
    for (let col = 2; col <= 7; col++) {
      excelRow.getCell(col).numFmt = '#,##0 "€"';
    }
    styleDataRow(excelRow, index % 2 === 0);
  });

  // --- Sheet 4: Cashflow Projection ---
  const cashflowSheet = workbook.addWorksheet("Cashflow-Projektion", {
    properties: { tabColor: { argb: EXCEL_COLORS.primary } },
  });

  const cfHeaders = ["Jahr", "Kum. Cashflow", "Immobilienwert", "Restschuld", "Nettovermögen"];
  cashflowSheet.getColumn(1).width = 8;
  for (let i = 2; i <= 5; i++) {
    cashflowSheet.getColumn(i).width = 20;
  }

  const cfHeaderRow = cashflowSheet.getRow(1);
  cfHeaderRow.values = cfHeaders;
  styleHeaderRow(cfHeaderRow);

  output.cumulativeCashflow.forEach((point, index) => {
    const excelRow = cashflowSheet.getRow(2 + index);
    excelRow.values = [
      point.year,
      Math.round(point.cumulativeCashflow),
      Math.round(point.propertyValue),
      Math.round(point.remainingDebt),
      Math.round(point.netWorth),
    ];
    for (let col = 2; col <= 5; col++) {
      excelRow.getCell(col).numFmt = '#,##0 "€"';
    }
    styleDataRow(excelRow, index % 2 === 0);
  });

  // --- Sheet 5: Summary / Key Metrics ---
  const summarySheet = workbook.addWorksheet("Zusammenfassung", {
    properties: { tabColor: { argb: EXCEL_COLORS.positive } },
  });

  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 25;

  // Title
  summarySheet.mergeCells("A1:B1");
  const summaryTitle = summarySheet.getCell("A1");
  summaryTitle.value = "Zusammenfassung der Investition";
  summaryTitle.font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.primary } };
  summarySheet.getRow(1).height = 28;

  const summaryData: [string, string][] = [
    ["Kaufpreis", fmtCurrency(input.purchasePrice)],
    ["Gesamtinvestition", fmtCurrency(output.investmentVolume.totalInvestment)],
    ["Eigenkapital", fmtCurrency(input.equity)],
    ["Darlehenssumme", fmtCurrency(output.financing.loanAmount)],
    ["", ""],
    ["Monatliche Rate", fmtCurrency(output.financing.monthlyPayment)],
    ["Monatlicher Cashflow", fmtCurrency(output.cashflow.monthlyCashflowAfterTax)],
    ["Jährlicher Cashflow", fmtCurrency(output.cashflow.cashflowAfterTax)],
    ["", ""],
    ["Bruttomietrendite", fmtPercent(output.yields.grossRentalYield)],
    ["Nettomietrendite", fmtPercent(output.yields.netRentalYield)],
    ["Eigenkapitalrendite", fmtPercent(output.yields.returnOnEquity)],
    ["Cashflow-Rendite", fmtPercent(output.yields.cashflowYield)],
    ["", ""],
    ["Jährlicher Steuereffekt", fmtCurrency(output.tax.taxEffect)],
    ["AfA-Betrag", fmtCurrency(output.tax.afaAmount)],
  ];

  summaryData.forEach(([label, value], index) => {
    const row = summarySheet.getRow(3 + index);
    row.values = [label, value];
    if (label === "") return;
    row.getCell(1).font = { bold: true, color: { argb: "333333" } };

    // Color code cashflow values
    if (label.includes("Cashflow") && output.cashflow.monthlyCashflowAfterTax < 0) {
      row.getCell(2).font = { color: { argb: EXCEL_COLORS.negative } };
    } else if (label.includes("Cashflow")) {
      row.getCell(2).font = { color: { argb: EXCEL_COLORS.positive } };
    }
  });

  return workbook;
}

/**
 * Export as native .xlsx file and trigger download
 */
export async function exportAsExcel(data: ExcelExportData): Promise<void> {
  const workbook = await buildExcelWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.xlsx`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
