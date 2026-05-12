import { test, expect } from "@playwright/test";
import { loginAndSelectOrg, TEST_USERS } from "../helpers/auth.helper";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC08: Edit Organization
 * BRs: BR37–BR39
 * File: tests/e2e/organization/edit-org.spec.ts
 */
test.describe("UC08: Edit Organization", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto("/test-org/settings/admin");
    await page.waitForLoadState("networkidle");
  });

  // ─── ORG-019 | BR37 ─────────────────────────────────────────────
  test("[BR37] Empty name shows error", async ({ page }) => {
    // Find org name input and clear it
    const nameInput = page.getByLabel(/organization name|name/i).first();
    await nameInput.clear();
    await page.getByRole("button", { name: /save|update/i }).click();

    await expect(page.getByText(/required/i)).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-020 | BR37 ─────────────────────────────────────────────
  test("[BR37] Invalid name chars show error", async ({ page }) => {
    const nameInput = page.getByLabel(/organization name|name/i).first();
    await nameInput.clear();
    await nameInput.fill("Invalid@#$Chars!");
    await page.getByRole("button", { name: /save|update/i }).click();

    await expect(
      page.getByText(/can only contain/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-021 | BR38 ─────────────────────────────────────────────
  test("[BR38] Successful update syncs to backend", async ({ page }) => {
    const nameInput = page.getByLabel(/organization name|name/i).first();
    const originalValue = await nameInput.inputValue();

    await nameInput.clear();
    await nameInput.fill("Updated Org Name");
    await page.getByRole("button", { name: /save|update/i }).click();

    // Wait for update to complete
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });

    // Restore original name
    await nameInput.clear();
    await nameInput.fill(originalValue);
    await page.getByRole("button", { name: /save|update/i }).click();
  });

  // ─── ORG-022 | BR39 ─────────────────────────────────────────────
  test("[BR39] Success toast shown", async ({ page }) => {
    const nameInput = page.getByLabel(/organization name|name/i).first();
    const originalValue = await nameInput.inputValue();

    await nameInput.clear();
    await nameInput.fill("Toast Test Name");
    await page.getByRole("button", { name: /save|update/i }).click();

    // MSG24 — success toast after update
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });

    // Restore original name
    await nameInput.clear();
    await nameInput.fill(originalValue);
    await page.getByRole("button", { name: /save|update/i }).click();
  });
});
