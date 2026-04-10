/**
 * Unit tests for Excel export generator
 * Tests all functions in src/lib/export/excel-generator.ts
 */

import { describe, it, expect } from "vitest";
import {
  generateAllSheets,
  sheetToCSV,
  generateSummaryStats,
  buildExcelWorkbook,
} from "@/lib/export/excel-generator";
import type { ExcelExportData, SheetData } from "@/lib/export/excel-generator";
import { getDefaultPropertyInput, calculatePropertyKPIs } from "@/lib/calculations";
import type { PropertyInput, Property } from "@/types";

// Helper: create standard ExcelExportData
function createExportData(overrides?: Partial<PropertyInput>): ExcelExportData {
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
  };
}

// ===========================================
// generateAllSheets Tests
// ===========================================
describe("generateAllSheets", () => {
  it("should return 4 sheets", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    expect(sheets.length).toBe(4);
  });

  it("should include Overview sheet", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    expect(sheets[0].name).toBe("Übersicht");
  });

  it("should include Side Costs sheet", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    expect(sheets[1].name).toBe("Nebenkosten");
  });

  it("should include Amortization sheet", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    expect(sheets[2].name).toBe("Tilgungsplan");
  });

  it("should include Cashflow sheet", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    expect(sheets[3].name).toBe("Cashflow-Projektion");
  });

  it("each sheet should have headers and rows", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);

    for (const sheet of sheets) {
      expect(sheet.headers.length).toBeGreaterThan(0);
      expect(sheet.rows.length).toBeGreaterThan(0);
    }
  });

  it("overview sheet should have correct headers", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const overview = sheets[0];

    expect(overview.headers).toEqual(["Kategorie", "Kennzahl", "Wert"]);
  });

  it("overview sheet should contain property name", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const overview = sheets[0];

    const nameRow = overview.rows.find((r) => r[1] === "Name");
    expect(nameRow).toBeDefined();
    expect(nameRow![2]).toBe("Test Immobilie");
  });

  it("overview sheet should contain purchase price", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const overview = sheets[0];

    const priceRow = overview.rows.find((r) => r[1] === "Kaufpreis");
    expect(priceRow).toBeDefined();
    expect(priceRow![2]).toBe(300000);
  });

  it("side costs sheet should have 5 rows", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const sideCosts = sheets[1];

    expect(sideCosts.rows.length).toBe(5);
  });

  it("amortization sheet should have rows matching schedule length", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const amort = sheets[2];

    expect(amort.rows.length).toBe(data.output.amortizationSchedule.length);
  });

  it("cashflow sheet should have rows matching cumulative cashflow length", () => {
    const data = createExportData();
    const sheets = generateAllSheets(data);
    const cashflow = sheets[3];

    expect(cashflow.rows.length).toBe(data.output.cumulativeCashflow.length);
  });
});

// ===========================================
// sheetToCSV Tests
// ===========================================
describe("sheetToCSV", () => {
  it("should produce CSV with semicolons", () => {
    const sheet: SheetData = {
      name: "Test",
      headers: ["A", "B", "C"],
      rows: [
        ["val1", 100, "val3"],
        ["val4", 200, "val6"],
      ],
    };

    const csv = sheetToCSV(sheet);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("A;B;C");
    expect(lines.length).toBe(3);
  });

  it("should format numbers with German locale", () => {
    const sheet: SheetData = {
      name: "Test",
      headers: ["Label", "Value"],
      rows: [["Test", 1234567.89]],
    };

    const csv = sheetToCSV(sheet);
    // German locale uses period as thousand separator and comma as decimal
    expect(csv).toContain("1.234.567,89");
  });

  it("should escape values containing semicolons", () => {
    const sheet: SheetData = {
      name: "Test",
      headers: ["Label", "Value"],
      rows: [["Test;Value", 100]],
    };

    const csv = sheetToCSV(sheet);
    expect(csv).toContain('"Test;Value"');
  });

  it("should escape values containing quotes", () => {
    const sheet: SheetData = {
      name: "Test",
      headers: ["Label", "Value"],
      rows: [['He said "hello"', 100]],
    };

    const csv = sheetToCSV(sheet);
    expect(csv).toContain('""hello""');
  });

  it("should handle empty rows", () => {
    const sheet: SheetData = {
      name: "Test",
      headers: ["A"],
      rows: [],
    };

    const csv = sheetToCSV(sheet);
    expect(csv).toBe("A");
  });
});

// ===========================================
// generateSummaryStats Tests
// ===========================================
describe("generateSummaryStats", () => {
  it("should return summary statistics", () => {
    const data = createExportData();
    const stats = generateSummaryStats(data);

    expect(stats).toBeDefined();
    expect(stats["Gesamtinvestition"]).toBeDefined();
    expect(stats["Eigenkapitalquote"]).toBeDefined();
    expect(stats["Bruttomietrendite"]).toBeDefined();
  });

  it("should have numeric total investment", () => {
    const data = createExportData();
    const stats = generateSummaryStats(data);

    expect(typeof stats["Gesamtinvestition"]).toBe("number");
    expect(stats["Gesamtinvestition"]).toBeGreaterThan(0);
  });

  it("should have string percentages", () => {
    const data = createExportData();
    const stats = generateSummaryStats(data);

    expect(typeof stats["Eigenkapitalquote"]).toBe("string");
    expect(String(stats["Eigenkapitalquote"])).toContain("%");
    expect(String(stats["Bruttomietrendite"])).toContain("%");
    expect(String(stats["Nettomietrendite"])).toContain("%");
    expect(String(stats["Eigenkapitalrendite"])).toContain("%");
  });

  it("should have positive years to repayment", () => {
    const data = createExportData();
    const stats = generateSummaryStats(data);

    expect(stats["Jahre bis Tilgung"]).toBeGreaterThan(0);
  });
});

// ===========================================
// buildExcelWorkbook Tests
// ===========================================
describe("buildExcelWorkbook", () => {
  it("should create a workbook with 5 worksheets", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);

    expect(workbook.worksheets.length).toBe(5);
  });

  it("should name worksheets correctly", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);
    const sheetNames = workbook.worksheets.map((ws) => ws.name);

    expect(sheetNames).toContain("Übersicht");
    expect(sheetNames).toContain("Nebenkosten");
    expect(sheetNames).toContain("Tilgungsplan");
    expect(sheetNames).toContain("Cashflow-Projektion");
    expect(sheetNames).toContain("Zusammenfassung");
  });

  it("should set workbook creator", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);

    expect(workbook.creator).toBe("ImmoCalc Pro");
  });

  it("overview sheet should have title in A1", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);
    const overview = workbook.getWorksheet("Übersicht");

    expect(overview).toBeDefined();
    const titleCell = overview!.getCell("A1").value;
    expect(String(titleCell)).toContain("Test Immobilie");
  });

  it("summary sheet should have key metrics", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);
    const summary = workbook.getWorksheet("Zusammenfassung");

    expect(summary).toBeDefined();
    // Check that at least one cell mentions Kaufpreis
    let foundKaufpreis = false;
    summary!.eachRow((row) => {
      row.eachCell((cell) => {
        if (String(cell.value).includes("Kaufpreis")) {
          foundKaufpreis = true;
        }
      });
    });
    expect(foundKaufpreis).toBe(true);
  });

  it("amortization sheet should have correct row count", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);
    const amort = workbook.getWorksheet("Tilgungsplan");

    expect(amort).toBeDefined();
    // Row 1 is header, data starts at row 2
    const dataRowCount = amort!.rowCount - 1;
    expect(dataRowCount).toBe(data.output.amortizationSchedule.length);
  });

  it("should handle zero purchase price", async () => {
    const data = createExportData({
      purchasePrice: 0,
      equity: 0,
      coldRentActual: 0,
    });

    const workbook = await buildExcelWorkbook(data);
    expect(workbook).toBeDefined();
    expect(workbook.worksheets.length).toBe(5);
  });

  it("should write buffer for xlsx export", async () => {
    const data = createExportData();
    const workbook = await buildExcelWorkbook(data);
    const buffer = await workbook.xlsx.writeBuffer();

    expect(buffer).toBeDefined();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
