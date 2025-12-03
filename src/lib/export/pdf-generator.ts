/**
 * PDF Export Generator
 * 
 * Generate professional PDF reports for property investments.
 * Uses basic structure - can be enhanced with @react-pdf/renderer or jspdf.
 */

import type { PropertyInput, PropertyOutput, Property } from '@/types';

export interface PDFReportData {
  property: Property;
  input: PropertyInput;
  output: PropertyOutput;
  generatedAt: Date;
  includeCharts?: boolean;
  includeAmortization?: boolean;
  language?: 'de' | 'en';
}

export interface ReportSection {
  title: string;
  content: string | string[] | Record<string, string | number>;
}

/**
 * Format currency for German locale
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
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
    title: 'Immobilien-Investitionsanalyse',
    content: {
      'Objektname': property.name,
      'Adresse': property.address || 'Nicht angegeben',
      'PLZ': property.postalCode || 'Nicht angegeben',
      'Erstellt am': data.generatedAt.toLocaleDateString('de-DE'),
    },
  });
  
  // Investment summary
  sections.push({
    title: 'Investitionsübersicht',
    content: {
      'Kaufpreis': formatCurrency(input.purchasePrice),
      'Nebenkosten': formatCurrency(output.investmentVolume.sideCosts.totalSideCosts),
      'Gesamtinvestition': formatCurrency(output.investmentVolume.totalInvestment),
      'Eigenkapital': formatCurrency(input.equity),
      'Finanzierungssumme': formatCurrency(output.financing.loanAmount),
    },
  });
  
  // Side costs breakdown
  sections.push({
    title: 'Nebenkosten',
    content: {
      'Maklerkosten': `${formatCurrency(output.investmentVolume.sideCosts.brokerCost)} (${input.brokerPercent}%)`,
      'Notarkosten': `${formatCurrency(output.investmentVolume.sideCosts.notaryCost)} (${input.notaryPercent}%)`,
      'Grunderwerbsteuer': `${formatCurrency(output.investmentVolume.sideCosts.propertyTransferTax)} (${input.propertyTransferTaxPercent}%)`,
      'Renovierungskosten': formatCurrency(output.investmentVolume.sideCosts.renovationCosts),
      'Gesamt': `${formatCurrency(output.investmentVolume.sideCosts.totalSideCosts)} (${output.investmentVolume.sideCosts.totalSideCostsPercent.toFixed(1)}%)`,
    },
  });
  
  // Financing details
  sections.push({
    title: 'Finanzierung',
    content: {
      'Darlehenssumme': formatCurrency(output.financing.loanAmount),
      'Zinssatz': formatPercent(input.interestRate),
      'Anfängliche Tilgung': formatPercent(input.repaymentRate),
      'Zinsbindung': `${input.fixedInterestPeriod} Jahre`,
      'Monatliche Rate': formatCurrency(output.financing.monthlyPayment),
      'Jährliche Rate': formatCurrency(output.financing.annualPayment),
    },
  });
  
  // Rental income
  sections.push({
    title: 'Mieteinnahmen',
    content: {
      'Kaltmiete (IST)': `${formatCurrency(input.coldRentActual)}/Monat`,
      'Kaltmiete (SOLL)': `${formatCurrency(input.coldRentTarget)}/Monat`,
      'Jahresmiete brutto': formatCurrency(output.cashflow.grossRentalIncome),
      'Leerstandsabzug': formatCurrency(output.cashflow.vacancyDeduction),
      'Jahresmiete netto': formatCurrency(output.cashflow.netRentalIncome),
    },
  });
  
  // Cashflow
  sections.push({
    title: 'Cashflow-Analyse',
    content: {
      'Netto-Mieteinnahmen': formatCurrency(output.cashflow.netRentalIncome),
      'Betriebskosten': formatCurrency(output.cashflow.operatingCosts),
      'Kapitaldienst': formatCurrency(output.cashflow.annualDebtService),
      'Cashflow vor Steuern': formatCurrency(output.cashflow.cashflowBeforeTax),
      'Steuereffekt': formatCurrency(output.cashflow.taxEffect),
      'Cashflow nach Steuern': formatCurrency(output.cashflow.cashflowAfterTax),
      'Monatlicher Cashflow': formatCurrency(output.cashflow.monthlyCashflowAfterTax),
    },
  });
  
  // Key metrics
  sections.push({
    title: 'Renditekennzahlen',
    content: {
      'Bruttomietrendite': formatPercent(output.yields.grossRentalYield),
      'Nettomietrendite': formatPercent(output.yields.netRentalYield),
      'Eigenkapitalrendite': formatPercent(output.yields.returnOnEquity),
      'Cashflow-Rendite': formatPercent(output.yields.cashflowYield),
    },
  });
  
  // Tax effects
  sections.push({
    title: 'Steuerliche Auswirkungen',
    content: {
      'AfA-Betrag': formatCurrency(output.tax.afaAmount),
      'Abzugsfähige Zinsen': formatCurrency(output.tax.deductibleInterest),
      'Weitere abzugsfähige Kosten': formatCurrency(output.tax.deductibleCosts),
      'Gesamte Werbungskosten': formatCurrency(output.tax.totalDeductions),
      'Zu versteuerndes Ergebnis': formatCurrency(output.tax.rentalIncomeAfterDeductions),
      'Jährlicher Steuereffekt': formatCurrency(output.tax.taxEffect),
    },
  });
  
  return sections;
}

/**
 * Generate plain text report (can be used for simple PDF generation)
 */
export function generatePlainTextReport(data: PDFReportData): string {
  const sections = generateReportSections(data);
  const lines: string[] = [];
  
  lines.push('═'.repeat(60));
  lines.push('IMMOBILIEN-INVESTITIONSANALYSE');
  lines.push('═'.repeat(60));
  lines.push('');
  
  for (const section of sections) {
    lines.push('─'.repeat(60));
    lines.push(section.title.toUpperCase());
    lines.push('─'.repeat(60));
    
    if (typeof section.content === 'string') {
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
    
    lines.push('');
  }
  
  lines.push('═'.repeat(60));
  lines.push('Dieses Dokument dient nur zu Informationszwecken.');
  lines.push('Alle Berechnungen basieren auf vereinfachten Annahmen.');
  lines.push('═'.repeat(60));
  
  return lines.join('\n');
}

/**
 * Generate HTML report (can be converted to PDF)
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
  <h1>🏠 Immobilien-Investitionsanalyse</h1>
  <p><strong>${data.property.name}</strong> | Erstellt am ${data.generatedAt.toLocaleDateString('de-DE')}</p>
  
  ${sections.map(section => `
    <div class="section">
      <h2>${section.title}</h2>
      ${typeof section.content === 'object' && !Array.isArray(section.content) 
        ? Object.entries(section.content).map(([key, value]) => `
          <div class="data-row">
            <span class="data-label">${key}</span>
            <span class="data-value">${value}</span>
          </div>
        `).join('')
        : `<p>${section.content}</p>`
      }
    </div>
  `).join('')}
  
  <div class="disclaimer">
    <p><strong>Haftungsausschluss:</strong> Dieses Dokument dient nur zu Informationszwecken und ersetzt keine professionelle Finanzberatung. Alle Berechnungen basieren auf vereinfachten Annahmen und können von der tatsächlichen Entwicklung abweichen.</p>
    <p>Generiert mit ImmoCalc Pro | ${data.generatedAt.toISOString()}</p>
  </div>
</body>
</html>
  `;
  
  return html.trim();
}

/**
 * Trigger download of report
 */
export function downloadReport(
  content: string,
  filename: string,
  type: 'text/plain' | 'text/html' = 'text/plain'
): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download HTML report
 */
export function exportHTMLReport(data: PDFReportData): void {
  const html = generateHTMLReport(data);
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, '-')}-${data.generatedAt.toISOString().split('T')[0]}.html`;
  downloadReport(html, filename, 'text/html');
}

/**
 * Generate and download text report
 */
export function exportTextReport(data: PDFReportData): void {
  const text = generatePlainTextReport(data);
  const filename = `immobilien-analyse-${data.property.name.toLowerCase().replace(/\s+/g, '-')}-${data.generatedAt.toISOString().split('T')[0]}.txt`;
  downloadReport(text, filename, 'text/plain');
}
