/**
 * PDF Export Generator
 *
 * Generate professional PDF reports for property investments using jsPDF.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PropertyInput, PropertyOutput, Property } from "@/types";

export interface PDFReportData {
  property: Property;
  input: PropertyInput;
  output: PropertyOutput;
  generatedAt: Date;
  includeCharts?: boolean;
  includeAmortization?: boolean;
  language?: "de" | "en";
}

export interface ReportSection {
  title: string;
  content: string | string[] | Record<string, string | number>;
}

/**
 * Brand colors for the PDF report
 */
const COLORS = {
  primary: [37, 99, 235] as [number, number, number], // #2563eb
  primaryDark: [30, 64, 175] as [number, number, number], // #1e40af
  text: [51, 51, 51] as [number, number, number], // #333333
  textLight: [102, 102, 102] as [number, number, number], // #666666
  white: [255, 255, 255] as [number, number, number],
  backgroundLight: [240, 249, 255] as [number, number, number], // #f0f9ff
  divider: [221, 221, 221] as [number, number, number], // #dddddd
  positive: [22, 163, 74] as [number, number, number], // #16a34a
  negative: [220, 38, 38] as [number, number, number], // #dc2626
};

/**
 * Format currency for German locale
 */
function formatCurrency(value: number): string {
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
function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generate report sections from property data
 */
export function generateReportSections(data: PDFReportData): ReportSection[] {
  const { property, input, output } = data;
  const sections: ReportSection[] = [];

  // Header section
  sections.push({
    title: "Immobilien-Investitionsanalyse",
    content: {
      Objektname: property.name,
      Adresse: property.address || "Nicht angegeben",
      PLZ: property.postalCode || "Nicht angegeben",
      "Erstellt am": data.generatedAt.toLocaleDateString("de-DE"),
    },
  });

  // Investment summary
  sections.push({
    title: "Investitionsübersicht",
    content: {
      Kaufpreis: formatCurrency(input.purchasePrice),
      Nebenkosten: formatCurrency(output.investmentVolume.sideCosts.totalSideCosts),
      Gesamtinvestition: formatCurrency(output.investmentVolume.totalInvestment),
      Eigenkapital: formatCurrency(input.equity),
      Finanzierungssumme: formatCurrency(output.financing.loanAmount),
    },
  });

  // Side costs breakdown
  sections.push({
    title: "Nebenkosten",
    content: {
      Maklerkosten: `${formatCurrency(output.investmentVolume.sideCosts.brokerCost)} (${input.brokerPercent}%)`,
      Notarkosten: `${formatCurrency(output.investmentVolume.sideCosts.notaryCost)} (${input.notaryPercent}%)`,
      Grunderwerbsteuer: `${formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)} (${input.propertyTransferTaxPercent}%)`,
      Renovierungskosten: formatCurrency(output.investmentVolume.sideCosts.renovationCosts),
      Gesamt: `${formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)} (${output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(1)}%)`,
    },
  });

  // Financing details
  sections.push({
    title: "Finanzierung",
    content: {
      Darlehenssumme: formatCurrency(output.financing.loanAmount),
      Zinssatz: formatPercent(input.interestRate),
      "Anfängliche Tilgung": formatPercent(input.repaymentRate),
      Zinsbindung: `${input.fixedInterestPeriod} Jahre`,
      "Monatliche Rate": formatCurrency(output.financing.monthlyPayment),
      "Jährliche Rate": formatCurrency(output.financing.annualPayment),
    },
  });

  // Rental income
  sections.push({
    title: "Mieteinnahmen",
    content: {
      "Kaltmiete (IST)": `${formatCurrency(input.coldRentActual)}/Monat`,
      "Kaltmiete (SOLL)": `${formatCurrency(input.coldRentTarget)}/Monat`,
      "Jahresmiete brutto": formatCurrency(output.cashflow.grossRentalIncome),
      Leerstandsabzug: formatCurrency(output.cashflow.vacancyDeduction),
      "Jahresmiete netto": formatCurrency(output.cashflow.netRentalIncome),
    },
  });

  // Cashflow
  sections.push({
    title: "Cashflow-Analyse",
    content: {
      "Netto-Mieteinnahmen": formatCurrency(output.cashflow.netRentalIncome),
      Betriebskosten: formatCurrency(output.cashflow.operatingCosts),
      Kapitaldienst: formatCurrency(output.cashflow.annualDebtService),
      "Cashflow vor Steuern": formatCurrency(output.cashflow.cashflowBeforeTax),
      Steuereffekt: formatCurrency(output.cashflow.taxEffect),
      "Cashflow nach Steuern": formatCurrency(output.cashflow.cashflowAfterTax),
      "Monatlicher Cashflow": formatCurrency(output.cashflow.monthlyCashflowAfterTax),
    },
  });

  // Key metrics
  sections.push({
    title: "Renditekennzahlen",
    content: {
      Bruttomietrendite: formatPercent(output.yields.grossRentalYield),
      Nettomietrendite: formatPercent(output.yields.netRentalYield),
      Eigenkapitalrendite: formatPercent(output.yields.returnOnEquity),
      "Cashflow-Rendite": formatPercent(output.yields.cashflowYield),
    },
  });

  // Tax effects
  sections.push({
    title: "Steuerliche Auswirkungen",
    content: {
      "AfA-Betrag": formatCurrency(output.tax.afaAmount),
      "Abzugsfähige Zinsen": formatCurrency(output.tax.deductibleInterest),
      "Weitere abzugsfähige Kosten": formatCurrency(output.tax.deductibleCosts),
      "Gesamte Werbungskosten": formatCurrency(output.tax.totalDeductions),
      "Zu versteuerndes Ergebnis": formatCurrency(output.tax.rentalIncomeAfterDeductions),
      "Jährlicher Steuereffekt": formatCurrency(output.tax.taxEffect),
    },
  });

  return sections;
}

/**
 * Generate plain text report
 */
export function generatePlainTextReport(data: PDFReportData): string {
  const sections = generateReportSections(data);
  const lines: string[] = [];

  lines.push("═".repeat(60));
  lines.push("IMMOBILIEN-INVESTITIONSANALYSE");
  lines.push("═".repeat(60));
  lines.push("");

  for (const section of sections) {
    lines.push("─".repeat(60));
    lines.push(section.title.toUpperCase());
    lines.push("─".repeat(60));

    if (typeof section.content === "string") {
      lines.push(section.content);
    } else if (Array.isArray(section.content)) {
      for (const item of section.content) {
        lines.push(`• ${item}`);
      }
    } else {
      for (const [key, value] of Object.entries(section.content)) {
        lines.push(`${key}: ${value}`);
      }
    }

    lines.push("");
  }

  lines.push("═".repeat(60));
  lines.push("Dieses Dokument dient nur zu Informationszwecken.");
  lines.push("Alle Berechnungen basieren auf vereinfachten Annahmen.");
  lines.push("═".repeat(60));

  return lines.join("\n");
}

/**
 * Generate HTML report (kept for backward compatibility)
 */
export function generateHTMLReport(data: PDFReportData): string {
  const sections = generateReportSections(data);

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Immobilien-Investitionsanalyse - ${data.property.name}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .section { margin-bottom: 25px; }
    .data-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .data-label { color: #666; }
    .data-value { font-weight: 600; }
    .highlight { background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .disclaimer { font-size: 12px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    @media print { body { padding: 0; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Immobilien-Investitionsanalyse</h1>
  <p><strong>${data.property.name}</strong> | Erstellt am ${data.generatedAt.toLocaleDateString("de-DE")}</p>
  
  ${sections
    .map(
      (section) => `
    <div class="section">
      <h2>${section.title}</h2>
      ${
        typeof section.content === "object" && !Array.isArray(section.content)
          ? Object.entries(section.content)
              .map(
                ([key, value]) => `
          <div class="data-row">
            <span class="data-label">${key}</span>
            <span class="data-value">${value}</span>
          </div>
        `
              )
              .join("")
          : `<p>${section.content}</p>`
      }
    </div>
  `
    )
    .join("")}
  
  <div class="disclaimer">
    <p><strong>Haftungsausschluss:</strong> Dieses Dokument dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen und k&ouml;nnen von der tats&auml;chlichen Entwicklung abweichen.</p>
    <p>Generiert mit ImmoCalc Pro | ${data.generatedAt.toISOString()}</p>
  </div>
</body>
</html>
  `;

  return html.trim();
}

/**
 * Trigger download of a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger download of report (kept for backward compatibility)
 */
export function downloadReport(
  content: string,
  filename: string,
  type: "text/plain" | "text/html" = "text/plain"
): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  downloadBlob(blob, filename);
}

/**
 * Generate and download HTML report (kept for backward compatibility)
 */
export function exportHTMLReport(data: PDFReportData): void {
  const html = generateHTMLReport(data);
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.html`;
  downloadReport(html, filename, "text/html");
}

/**
 * Generate and download text report (kept for backward compatibility)
 */
export function exportTextReport(data: PDFReportData): void {
  const text = generatePlainTextReport(data);
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.txt`;
  downloadReport(text, filename, "text/plain");
}

// ============================================
// Professional PDF Export using jsPDF
// ============================================

/**
 * Add a section header to the PDF document
 */
function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text(title, 14, y);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(14, y + 2, 196, y + 2);
  return y + 10;
}

/**
 * Check if we need a new page and add one if necessary
 */
function checkPageBreak(doc: jsPDF, y: number, requiredSpace: number = 30): number {
  if (y + requiredSpace > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}

/**
 * Build a jsPDF document from report data (does not trigger download)
 */
export function buildPDFDocument(data: PDFReportData): jsPDF {
  const { property, input, output } = data;
  const doc = new jsPDF();

  // --- Title Page Header ---
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.text("Immobilien-Investitionsanalyse", 14, 20);
  doc.setFontSize(12);
  doc.text(property.name, 14, 30);

  // Property metadata
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  let y = 50;
  doc.text(`Adresse: ${property.address || "Nicht angegeben"}`, 14, y);
  doc.text(`PLZ: ${property.postalCode || "Nicht angegeben"}`, 120, y);
  y += 6;
  doc.text(`Erstellt am: ${data.generatedAt.toLocaleDateString("de-DE")}`, 14, y);
  y += 4;
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);
  y += 8;

  // --- Key Metrics Summary Box ---
  doc.setFillColor(...COLORS.backgroundLight);
  doc.roundedRect(14, y, 182, 32, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  const metricsY = y + 8;
  const colWidth = 45.5;

  // Row 1 labels
  doc.text("Gesamtinvestition", 18, metricsY);
  doc.text("Eigenkapital", 18 + colWidth, metricsY);
  doc.text("Monatl. Cashflow", 18 + colWidth * 2, metricsY);
  doc.text("Bruttomietrendite", 18 + colWidth * 3, metricsY);

  // Row 1 values
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(formatCurrency(output.investmentVolume.totalInvestment), 18, metricsY + 7);
  doc.text(formatCurrency(input.equity), 18 + colWidth, metricsY + 7);

  const monthlyCf = output.cashflow.monthlyCashflowAfterTax;
  doc.setTextColor(...(monthlyCf >= 0 ? COLORS.positive : COLORS.negative));
  doc.text(formatCurrency(monthlyCf), 18 + colWidth * 2, metricsY + 7);

  doc.setTextColor(...COLORS.text);
  doc.text(formatPercent(output.yields.grossRentalYield), 18 + colWidth * 3, metricsY + 7);

  // Row 2 labels
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Nettomietrendite", 18, metricsY + 15);
  doc.text("EK-Rendite", 18 + colWidth, metricsY + 15);
  doc.text("Cashflow-Rendite", 18 + colWidth * 2, metricsY + 15);
  doc.text("Zinssatz", 18 + colWidth * 3, metricsY + 15);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(formatPercent(output.yields.netRentalYield), 18, metricsY + 22);
  doc.text(formatPercent(output.yields.returnOnEquity), 18 + colWidth, metricsY + 22);
  doc.text(formatPercent(output.yields.cashflowYield), 18 + colWidth * 2, metricsY + 22);
  doc.text(formatPercent(input.interestRate), 18 + colWidth * 3, metricsY + 22);

  y += 40;

  // --- Investment Overview Table ---
  y = addSectionHeader(doc, "Investitionsübersicht", y);
  autoTable(doc, {
    startY: y,
    head: [["Kennzahl", "Wert"]],
    body: [
      ["Kaufpreis", formatCurrency(input.purchasePrice)],
      ["Nebenkosten gesamt", formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)],
      ["Gesamtinvestition", formatCurrency(output.investmentVolume.totalInvestment)],
      ["Eigenkapital", formatCurrency(input.equity)],
      ["Darlehenssumme", formatCurrency(output.financing.loanAmount)],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Side Costs Table ---
  y = checkPageBreak(doc, y, 50);
  y = addSectionHeader(doc, "Nebenkosten", y);
  autoTable(doc, {
    startY: y,
    head: [["Kostenart", "Prozent", "Betrag"]],
    body: [
      [
        "Maklerkosten",
        formatPercent(input.brokerPercent),
        formatCurrency(output.investmentVolume.sideCosts.brokerCost),
      ],
      [
        "Notarkosten",
        formatPercent(input.notaryPercent),
        formatCurrency(output.investmentVolume.sideCosts.notaryCost),
      ],
      [
        "Grunderwerbsteuer",
        formatPercent(input.propertyTransferTaxPercent),
        formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax),
      ],
      [
        "Renovierungskosten",
        "-",
        formatCurrency(output.investmentVolume.sideCosts.renovationCosts),
      ],
      [
        "Gesamt",
        formatPercent(output.investmentVolume.sideCosts.totalSideCostsPercent, 1),
        formatCurrency(output.investmentVolume.sideCosts.totalSideCosts),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Financing Table ---
  y = checkPageBreak(doc, y, 50);
  y = addSectionHeader(doc, "Finanzierung", y);
  autoTable(doc, {
    startY: y,
    head: [["Kennzahl", "Wert"]],
    body: [
      ["Darlehenssumme", formatCurrency(output.financing.loanAmount)],
      ["Zinssatz", formatPercent(input.interestRate)],
      ["Anfängliche Tilgung", formatPercent(input.repaymentRate)],
      ["Zinsbindung", `${input.fixedInterestPeriod} Jahre`],
      ["Monatliche Rate", formatCurrency(output.financing.monthlyPayment)],
      ["Jährliche Rate", formatCurrency(output.financing.annualPayment)],
      ["Gesamtzinsen (Zinsbindung)", formatCurrency(output.financing.totalInterest)],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Cashflow Table ---
  y = checkPageBreak(doc, y, 60);
  y = addSectionHeader(doc, "Cashflow-Analyse", y);
  autoTable(doc, {
    startY: y,
    head: [["Position", "Jährlich", "Monatlich"]],
    body: [
      [
        "Mieteinnahmen brutto",
        formatCurrency(output.cashflow.grossRentalIncome),
        formatCurrency(output.cashflow.grossRentalIncome / 12),
      ],
      [
        "Leerstandsabzug",
        formatCurrency(-output.cashflow.vacancyDeduction),
        formatCurrency(-output.cashflow.vacancyDeduction / 12),
      ],
      [
        "Netto-Mieteinnahmen",
        formatCurrency(output.cashflow.netRentalIncome),
        formatCurrency(output.cashflow.netRentalIncome / 12),
      ],
      [
        "Betriebskosten",
        formatCurrency(-output.cashflow.operatingCosts),
        formatCurrency(-output.cashflow.operatingCosts / 12),
      ],
      [
        "Kapitaldienst",
        formatCurrency(-output.cashflow.annualDebtService),
        formatCurrency(-output.cashflow.annualDebtService / 12),
      ],
      [
        "Cashflow vor Steuern",
        formatCurrency(output.cashflow.cashflowBeforeTax),
        formatCurrency(output.cashflow.monthlyCashflowBeforeTax),
      ],
      [
        "Steuereffekt",
        formatCurrency(output.cashflow.taxEffect),
        formatCurrency(output.cashflow.taxEffect / 12),
      ],
      [
        "Cashflow nach Steuern",
        formatCurrency(output.cashflow.cashflowAfterTax),
        formatCurrency(output.cashflow.monthlyCashflowAfterTax),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Yield Metrics ---
  y = checkPageBreak(doc, y, 40);
  y = addSectionHeader(doc, "Renditekennzahlen", y);
  autoTable(doc, {
    startY: y,
    head: [["Kennzahl", "Wert"]],
    body: [
      ["Bruttomietrendite", formatPercent(output.yields.grossRentalYield)],
      ["Nettomietrendite", formatPercent(output.yields.netRentalYield)],
      ["Eigenkapitalrendite (ROE)", formatPercent(output.yields.returnOnEquity)],
      ["Cashflow-Rendite", formatPercent(output.yields.cashflowYield)],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Tax Effects ---
  y = checkPageBreak(doc, y, 50);
  y = addSectionHeader(doc, "Steuerliche Auswirkungen", y);
  autoTable(doc, {
    startY: y,
    head: [["Position", "Betrag"]],
    body: [
      ["AfA (Gebäudeabschreibung)", formatCurrency(output.tax.afaAmount)],
      ["Abzugsfähige Zinsen", formatCurrency(output.tax.deductibleInterest)],
      ["Weitere abzugsfähige Kosten", formatCurrency(output.tax.deductibleCosts)],
      ["Gesamte Werbungskosten", formatCurrency(output.tax.totalDeductions)],
      ["Zu versteuerndes Ergebnis", formatCurrency(output.tax.rentalIncomeAfterDeductions)],
      ["Jährlicher Steuereffekt", formatCurrency(output.tax.taxEffect)],
    ],
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // --- Amortization Schedule (if included) ---
  if (data.includeAmortization && output.amortizationSchedule.length > 0) {
    doc.addPage();
    y = 20;
    y = addSectionHeader(doc, "Tilgungsplan", y);
    autoTable(doc, {
      startY: y,
      head: [
        ["Jahr", "Anfangssaldo", "Zinsen", "Tilgung", "Endsaldo", "Kum. Zinsen", "Kum. Tilgung"],
      ],
      body: output.amortizationSchedule.map((row) => [
        row.year.toString(),
        formatCurrency(row.startingBalance),
        formatCurrency(row.interestPayment),
        formatCurrency(row.principalPayment),
        formatCurrency(row.endingBalance),
        formatCurrency(row.cumulativeInterest),
        formatCurrency(row.cumulativePrincipal),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
  }

  // --- Footer on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text(
      "Haftungsausschluss: Dieses Dokument dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung.",
      14,
      287
    );
    doc.text(`Generiert mit ImmoCalc Pro | Seite ${i}/${totalPages}`, 14, 292);
  }

  return doc;
}

/**
 * Generate a professional PDF report and trigger download
 */
export function exportPDFReport(data: PDFReportData): void {
  const doc = buildPDFDocument(data);
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, "-")}-${data.generatedAt.toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate a PDF report and return as Blob (useful for previews or uploads)
 */
export function generatePDFBlob(data: PDFReportData): Blob {
  const doc = buildPDFDocument(data);
  return doc.output("blob");
}
