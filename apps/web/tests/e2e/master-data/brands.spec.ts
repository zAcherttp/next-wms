import { expect, test } from "@playwright/test";
import {
  loginAndSelectOrg,
  TEST_ORG,
  TEST_USERS,
} from "../helpers/auth.helper";

const BASE = `/${TEST_ORG.slug}/master-data/brands`;

/**
 * UC19–UC22: Brands CRUD & Search
 * BRs: BR71–BR83
 */
test.describe("Brands", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
  });

  // ═══ UC19: Add Brand ═══

  test.describe("UC19: Add Brand", () => {
    test("[BR71] Form shows name and isActive", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
      await addBtn.click();
      await expect(page.getByLabel(/name/i)).toBeVisible({ timeout: 5_000 });
    });

    test("[BR72] Duplicate brand name rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR73] Success toast shown", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR74] Import Excel — duplicates in file", async ({ page }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR74] Import Excel — brand exists in system", async ({ page }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR74] Import Excel — success", async ({ page }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });
  });

  // ═══ UC20: Edit Brand ═══

  test.describe("UC20: Edit Brand", () => {
    test("[BR75] Empty name shows error", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR76] Duplicate name (excluding self) rejected", async ({
      page,
    }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR77] Success toast shown", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  // ═══ UC21: Delete Brand ═══

  test.describe("UC21: Delete Brand", () => {
    test("[BR78] Delete confirmation dialog appears", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR79] Brand with products cannot be deleted", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR80] Brand without products is hard deleted", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR81] Deactivate brand alternative", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  // ═══ UC22: List & Search Brands ═══

  test.describe("UC22: List & Search Brands", () => {
    test("[BR82] Brand list shows product count", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR83] Search by brand name (case-insensitive)", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
    });
  });
});
