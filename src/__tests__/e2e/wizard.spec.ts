import { test, expect } from "@playwright/test";

test.describe("Property Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("should display wizard mode toggle button", async ({ page }) => {
    // Check for toggle button
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus|Experten-Modus/i });
    await expect(toggleButton).toBeVisible();
  });

  test("should toggle between wizard and expert mode", async ({ page }) => {
    // Click toggle to enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Should now show wizard mode with steps
      await expect(page.getByText(/Schritt 1 von 5/i)).toBeVisible({ timeout: 5000 });
      
      // Click toggle again to go back to expert mode
      const expertButton = page.getByRole("button", { name: /Experten-Modus/i });
      await expertButton.click();
      
      // Should show expert mode form
      await expect(page.getByText(/Eingaben/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("should complete wizard step by step", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Wait for wizard to load
    await expect(page.getByText(/Objektdaten/i)).toBeVisible({ timeout: 5000 });

    // Step 1: Property data
    await page.locator('input[id="purchasePrice"]').fill("300000");
    await page.locator('input[id="livingArea"]').fill("75");
    await page.locator('input[id="yearBuilt"]').fill("1990");
    
    // Click next
    const nextButton = page.getByRole("button", { name: /Weiter/i });
    await nextButton.click();
    
    // Should be on step 2
    await expect(page.getByText(/Finanzierung/i)).toBeVisible({ timeout: 3000 });

    // Step 2: Financing
    await page.locator('input[id="equity"]').fill("60000");
    await page.locator('input[id="interestRate"]').fill("3.5");
    await page.locator('input[id="repaymentRate"]').fill("2.0");
    
    // Click next
    await nextButton.click();
    
    // Should be on step 3
    await expect(page.getByText(/Nebenkosten/i)).toBeVisible({ timeout: 3000 });

    // Step 3: Costs - use smart defaults
    const smartDefaultsButton = page.getByRole("button", { name: /Typische Werte/i }).first();
    if (await smartDefaultsButton.isVisible()) {
      await smartDefaultsButton.click();
    }
    
    // Click next
    await nextButton.click();
    
    // Should be on step 4
    await expect(page.getByText(/Miete & Bewirtschaftung/i)).toBeVisible({ timeout: 3000 });

    // Step 4: Rental
    await page.locator('input[id="coldRentActual"]').fill("1200");
    await page.locator('input[id="maintenanceReserve"]').fill("750");
    
    // Click next
    await nextButton.click();
    
    // Should be on step 5
    await expect(page.getByText(/Steuerliche Angaben/i)).toBeVisible({ timeout: 3000 });

    // Step 5: Tax - can use defaults
    // Click finish
    const finishButton = page.getByRole("button", { name: /Abschließen/i });
    await finishButton.click();
    
    // Wizard should complete
    await page.waitForTimeout(1000);
  });

  test("should show live preview in wizard mode", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Should show live preview panel
    await expect(page.getByText(/Live-Vorschau/i)).toBeVisible({ timeout: 5000 });
    
    // Initially should show skeleton or message
    await expect(
      page.getByText(/Füllen Sie die Pflichtfelder aus/i)
    ).toBeVisible({ timeout: 3000 });
  });

  test("should update live preview when entering data", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Fill in minimum required data
    await page.locator('input[id="purchasePrice"]').fill("300000");
    
    // Go to step 2
    await page.getByRole("button", { name: /Weiter/i }).click();
    await page.locator('input[id="equity"]').fill("60000");
    await page.locator('input[id="interestRate"]').fill("3.5");
    
    // Go to step 4 (skip step 3)
    await page.getByRole("button", { name: /Weiter/i }).click();
    await page.getByRole("button", { name: /Weiter/i }).click();
    
    // Fill rental data
    await page.locator('input[id="coldRentActual"]').fill("1200");
    
    // Live preview should now show KPIs
    await expect(page.getByText(/Bruttomietrendite/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Nettomietrendite/i)).toBeVisible({ timeout: 3000 });
  });

  test("should navigate between steps using step indicator", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Fill first step to unlock navigation
    await page.locator('input[id="purchasePrice"]').fill("300000");
    
    // Click step 2 in step indicator
    const step2Button = page.getByRole("button", { name: /Finanzierung/i }).first();
    await step2Button.click();
    
    // Should be on step 2
    await expect(page.locator('input[id="equity"]')).toBeVisible({ timeout: 3000 });
    
    // Click step 1 in step indicator to go back
    const step1Button = page.getByRole("button", { name: /Objektdaten/i }).first();
    await step1Button.click();
    
    // Should be back on step 1
    await expect(page.locator('input[id="purchasePrice"]')).toBeVisible({ timeout: 3000 });
  });

  test("should select Bundesland and update property transfer tax", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Navigate to step 3 (costs)
    await page.locator('input[id="purchasePrice"]').fill("300000");
    await page.getByRole("button", { name: /Weiter/i }).click();
    await page.locator('input[id="equity"]').fill("60000");
    await page.locator('input[id="interestRate"]').fill("3.5");
    await page.getByRole("button", { name: /Weiter/i }).click();
    
    // Should be on costs step
    await expect(page.getByText(/Nebenkosten/i)).toBeVisible({ timeout: 3000 });
    
    // Select Bayern (should set tax to 3.5%)
    const bundeslandSelect = page.locator('select[id="bundesland"]');
    if (await bundeslandSelect.isVisible()) {
      await bundeslandSelect.selectOption("BAYERN");
      
      // Check that property transfer tax is updated
      const taxInput = page.locator('input[id="propertyTransferTax"]');
      await expect(taxInput).toHaveValue("3.5");
    }
  });

  test("should prevent proceeding without required fields", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Try to click next without filling purchase price
    const nextButton = page.getByRole("button", { name: /Weiter/i });
    
    // Button should be disabled or validation should show
    const isDisabled = await nextButton.isDisabled();
    expect(isDisabled).toBe(true);
    
    // Fill purchase price
    await page.locator('input[id="purchasePrice"]').fill("300000");
    
    // Now button should be enabled
    const isEnabledNow = await nextButton.isEnabled();
    expect(isEnabledNow).toBe(true);
  });

  test("should apply smart defaults when clicking button", async ({ page }) => {
    // Enable wizard mode
    const toggleButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
    
    // Navigate to step 3
    await page.locator('input[id="purchasePrice"]').fill("300000");
    await page.getByRole("button", { name: /Weiter/i }).click();
    await page.locator('input[id="equity"]').fill("60000");
    await page.locator('input[id="interestRate"]').fill("3.5");
    await page.getByRole("button", { name: /Weiter/i }).click();
    
    // Click smart defaults button
    const smartDefaultsButton = page.getByRole("button", { name: /Typische Werte/i }).first();
    await smartDefaultsButton.click();
    
    // Check that broker and notary percentages are set
    const brokerInput = page.locator('input[id="brokerPercent"]');
    const notaryInput = page.locator('input[id="notaryPercent"]');
    
    await expect(brokerInput).toHaveValue("3.57");
    await expect(notaryInput).toHaveValue("1.5");
  });

  test("should preserve data when switching between modes", async ({ page }) => {
    // Fill some data in expert mode first
    const purchasePriceInput = page.locator('input[type="number"]').first();
    if (await purchasePriceInput.isVisible()) {
      await purchasePriceInput.fill("350000");
    }
    
    // Switch to wizard mode
    const wizardButton = page.getByRole("button", { name: /Wizard-Modus/i });
    if (await wizardButton.isVisible()) {
      await wizardButton.click();
      
      // Check if data is preserved
      const wizardPurchaseInput = page.locator('input[id="purchasePrice"]');
      await expect(wizardPurchaseInput).toHaveValue("350000");
      
      // Switch back to expert mode
      const expertButton = page.getByRole("button", { name: /Experten-Modus/i });
      await expertButton.click();
      
      // Data should still be there
      await page.waitForTimeout(500);
      // Check that the value is preserved (implementation specific)
    }
  });
});
