/**
 * Unit tests for PDF export generator
 * Tests all functions in src/lib/export/pdf-generator.ts
 */

import { describe, it, expect } from "vitest";
import {
  generateReportSections,
  generatePlainTextReport,
  generateHTMLReport,
  buildPDFDocument,
} from "@/lib/export/pdf-generator";
import type { PDFReportData } from "@/lib/export/pdf-generator";
import { getDefaultPropertyInput, calculatePropertyKPIs } from "@/lib/calculations";
import type { PropertyInput, PropertyOutput, Property } from "@/types";

// Helper: create a standard PDFReportData object
function createReportData(overrides?: Partial<PropertyInput>): PDFReportData {
  const input = { ...getDefaultPropertyInput(), ...overrides };
  const output = calculatePropertyKPIs(input);
  const property: Property = {
    id: "test-1",
    name: "Test Immobilie",
    address: "Musterstraße 1, 80333 München",
    postalCode: "80333",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    input,
    output,
  };

  return {
    property,
    input,
    output,
    generatedAt: new Date("2024-01-15T10:00:00Z"),
    includeCharts: false,
    includeAmortization: false,
  };
}

// ===========================================
// generateReportSections Tests
// ===========================================
describe("generateReportSections", () => {
  it("should return an array of sections", () => {
    const data = createReportData();
    const sections = generateReportSections(data);

    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });

  it("should include all required sections", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    const titles = sections.map((s) => s.title);

    expect(titles).toContain("Immobilien-Investitionsanalyse");
    expect(titles).toContain("Investitionsübersicht");
    expect(titles).toContain("Nebenkosten");
    expect(titles).toContain("Finanzierung");
    expect(titles).toContain("Mieteinnahmen");
    expect(titles).toContain("Cashflow-Analyse");
    expect(titles).toContain("Renditekennzahlen");
    expect(titles).toContain("Steuerliche Auswirkungen");
  });

  it("should have 8 sections total", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    expect(sections.length).toBe(8);
  });

  it("header section should contain property name", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    const header = sections[0];

    expect(header.content).toHaveProperty("Objektname", "Test Immobilie");
  });

  it("header section should contain address", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    const header = sections[0];

    expect((header.content as Record<string, string>)["Adresse"]).toBe(
      "Musterstraße 1, 80333 München"
    );
  });

  it("should handle missing address", () => {
    const data = createReportData();
    data.property.address = undefined;
    const sections = generateReportSections(data);
    const header = sections[0];

    expect((header.content as Record<string, string>)["Adresse"]).toBe("Nicht angegeben");
  });

  it("investment section should contain purchase price", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    const investment = sections[1];
    const content = investment.content as Record<string, string>;

    // Should be formatted as German currency
    expect(content["Kaufpreis"]).toContain("300");
  });

  it("yield section should contain formatted percentages", () => {
    const data = createReportData();
    const sections = generateReportSections(data);
    const yields = sections.find((s) => s.title === "Renditekennzahlen");

    expect(yields).toBeDefined();
    const content = yields!.content as Record<string, string>;
    expect(content["Bruttomietrendite"]).toContain("%");
    expect(content["Nettomietrendite"]).toContain("%");
  });
});

// ===========================================
// generatePlainTextReport Tests
// ===========================================
describe("generatePlainTextReport", () => {
  it("should generate a non-empty text report", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    expect(text.length).toBeGreaterThan(100);
  });

  it("should contain the title line", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    expect(text).toContain("IMMOBILIEN-INVESTITIONSANALYSE");
  });

  it("should contain all section titles in uppercase", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    expect(text).toContain("INVESTITIONSÜBERSICHT");
    expect(text).toContain("NEBENKOSTEN");
    expect(text).toContain("FINANZIERUNG");
    expect(text).toContain("MIETEINNAHMEN");
    expect(text).toContain("CASHFLOW-ANALYSE");
    expect(text).toContain("RENDITEKENNZAHLEN");
  });

  it("should contain the disclaimer", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    expect(text).toContain("Informationszwecken");
    expect(text).toContain("vereinfachten Annahmen");
  });

  it("should contain the property name", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    expect(text).toContain("Test Immobilie");
  });

  it("should contain currency values", () => {
    const data = createReportData();
    const text = generatePlainTextReport(data);

    // Should contain Euro-formatted values
    expect(text).toContain("€");
  });
});

// ===========================================
// generateHTMLReport Tests
// ===========================================
describe("generateHTMLReport", () => {
  it("should generate valid HTML", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
  });

  it("should contain the property name in the title", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("Test Immobilie");
  });

  it("should contain German locale date", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    // German date format
    expect(html).toContain("15.1.2024");
  });

  it("should include CSS styles", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("<style>");
    expect(html).toContain("font-family");
  });

  it("should include the disclaimer", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("Haftungsausschluss");
    expect(html).toContain("ImmoCalc Pro");
  });

  it("should contain data rows with labels and values", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("data-row");
    expect(html).toContain("data-label");
    expect(html).toContain("data-value");
  });

  it("should have sections for each data category", () => {
    const data = createReportData();
    const html = generateHTMLReport(data);

    expect(html).toContain("Investitionsübersicht");
    expect(html).toContain("Nebenkosten");
    expect(html).toContain("Finanzierung");
    expect(html).toContain("Cashflow-Analyse");
    expect(html).toContain("Renditekennzahlen");
  });
});

// ===========================================
// buildPDFDocument Tests
// ===========================================
describe("buildPDFDocument", () => {
  it("should create a jsPDF document", () => {
    const data = createReportData();
    const doc = buildPDFDocument(data);

    expect(doc).toBeDefined();
    expect(typeof doc.getNumberOfPages).toBe("function");
  });

  it("should have at least 1 page", () => {
    const data = createReportData();
    const doc = buildPDFDocument(data);

    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("should add amortization page when includeAmortization is true", () => {
    const data = createReportData();
    data.includeAmortization = true;
    const docWithAmort = buildPDFDocument(data);

    data.includeAmortization = false;
    const docWithout = buildPDFDocument(data);

    expect(docWithAmort.getNumberOfPages()).toBeGreaterThan(docWithout.getNumberOfPages());
  });

  it("should handle property with zero values", () => {
    const data = createReportData({
      purchasePrice: 0,
      equity: 0,
      coldRentActual: 0,
    });

    // Should not throw
    const doc = buildPDFDocument(data);
    expect(doc).toBeDefined();
  });

  it("should handle property with large values", () => {
    const data = createReportData({
      purchasePrice: 10000000,
      equity: 5000000,
      coldRentActual: 50000,
    });

    const doc = buildPDFDocument(data);
    expect(doc).toBeDefined();
  });
});
