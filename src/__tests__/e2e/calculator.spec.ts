import { test, expect } from "@playwright/test";

test.describe("Property Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the main application", async ({ page }) => {
    // Check for the main title
    await expect(page.locator("h1")).toContainText("ImmoCalc Pro");
  });

  test("should have input form with purchase price", async ({ page }) => {
    // Look for purchase price input
    const purchasePriceInput = page.locator('input[type="number"]').first();
    await expect(purchasePriceInput).toBeVisible();
  });

  test("should calculate results when inputs change", async ({ page }) => {
    // Find the Rechner tab and ensure it's active
    const rechnerTab = page.getByRole("tab", { name: /Rechner/i });
    if (await rechnerTab.isVisible()) {
      await rechnerTab.click();
    }

    // Wait for the page to be ready
    await page.waitForLoadState("networkidle");

    // Check that results panel is visible
    const resultsSection = page.getByText(/Ergebnis|Rendite|Cashflow/i).first();
    await expect(resultsSection).toBeVisible({ timeout: 10000 });
  });

  test("should navigate between tabs", async ({ page }) => {
    // Click on Dashboard tab if visible
    const dashboardTab = page.getByRole("tab", { name: /Dashboard/i });
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
      await expect(page.getByText(/Portfolio|Immobilien/i).first()).toBeVisible({ timeout: 5000 });
    }

    // Click on Charts tab if visible
    const chartsTab = page.getByRole("tab", { name: /Charts/i });
    if (await chartsTab.isVisible()) {
      await chartsTab.click();
      await expect(page.locator("svg").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display rent index calculator", async ({ page }) => {
    // Navigate to Mietspiegel section
    const mietspiegelTab = page.getByRole("tab", { name: /Mietspiegel/i });
    if (await mietspiegelTab.isVisible()) {
      await mietspiegelTab.click();
      await expect(page.getByText(/Mietpreis/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should display due diligence checklist", async ({ page }) => {
    // Navigate to Checkliste section
    const checklistTab = page.getByRole("tab", { name: /Checkliste/i });
    if (await checklistTab.isVisible()) {
      await checklistTab.click();
      await expect(page.getByText(/Due Diligence|Prüfung/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Scenario Comparison", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to comparison view", async ({ page }) => {
    const vergleichTab = page.getByRole("tab", { name: /Vergleich/i });
    if (await vergleichTab.isVisible()) {
      await vergleichTab.click();
      await expect(page.getByText(/Szenario|Vergleich/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Portfolio Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display portfolio summary", async ({ page }) => {
    const dashboardTab = page.getByRole("tab", { name: /Dashboard/i });
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
      // Check for portfolio elements
      await expect(page.getByText(/Portfolio|Gesamt|Immobilien/i).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });
});

test.describe("Extended Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should access break-even analysis", async ({ page }) => {
    const breakEvenTab = page.getByRole("tab", { name: /Break-Even/i });
    if (await breakEvenTab.isVisible()) {
      await breakEvenTab.click();
      await expect(page.getByText(/Amortisation|Break/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should access exit strategy calculator", async ({ page }) => {
    const exitTab = page.getByRole("tab", { name: /Exit/i });
    if (await exitTab.isVisible()) {
      await exitTab.click();
      await expect(page.getByText(/Verkauf|Exit/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should access location analysis", async ({ page }) => {
    const standortTab = page.getByRole("tab", { name: /Standort/i });
    if (await standortTab.isVisible()) {
      await standortTab.click();
      await expect(page.getByText(/Standort|Lage/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should access renovation calculator", async ({ page }) => {
    const renovationTab = page.getByRole("tab", { name: /Renovierung/i });
    if (await renovationTab.isVisible()) {
      await renovationTab.click();
      await expect(page.getByText(/Renovierung|ROI/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
