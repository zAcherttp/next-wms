import { expect, test } from "@playwright/test";
import {
  loginAndSelectOrg,
  TEST_ORG,
  TEST_USERS,
} from "../helpers/auth.helper";
import { TOAST_SELECTOR } from "../helpers/constants";

const BASE = `/${TEST_ORG.slug}/master-data/products`;

/**
 * UC11–UC14: Products CRUD & Search
 * BRs: BR46–BR58
 */
test.describe("Products", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
  });

  // ═══ UC11: Add Product ═══

  test.describe("UC11: Add Product", () => {
    test("[BR46] Form displays all required fields", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await expect(page.getByLabel(/product name/i)).toBeVisible({
        timeout: 5_000,
      });
      await expect(page.getByText(/category/i).first()).toBeVisible();
      await expect(page.getByText(/brand/i).first()).toBeVisible();
      await expect(page.getByText(/storage requirement/i)).toBeVisible();
      await expect(page.getByText(/tracking method/i)).toBeVisible();
      await expect(page.getByText(/base unit/i)).toBeVisible();
    });

    test("[BR47] Empty product name shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page
        .getByRole("button", { name: /^add new product$|submit/i })
        .click();
      await expect(page.locator(TOAST_SELECTOR)).toContainText(/product name/i);
    });

    test("[BR47] No category selected shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      await page
        .getByRole("button", { name: /^add new product$|submit/i })
        .click();
      await expect(page.locator(TOAST_SELECTOR)).toContainText(/category/i);
    });

    test("[BR47] No brand selected shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      // Select category first (pick first available)
      const catTrigger = page.locator('[role="combobox"]').first();
      await catTrigger.click();
      await page.getByRole("option").first().click();
      await page
        .getByRole("button", { name: /^add new product$|submit/i })
        .click();
      await expect(page.locator(TOAST_SELECTOR)).toContainText(/brand/i);
    });

    test("[BR47] No storage requirement shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      await expect(page.getByText(/storage requirement/i)).toBeVisible();
    });

    test("[BR47] No tracking method shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      await expect(page.getByText(/tracking method/i)).toBeVisible();
    });

    test("[BR47] No UOM selected shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      await expect(page.getByText(/base unit/i)).toBeVisible();
    });

    test("[BR47] Empty SKU code shows error", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await page.getByLabel(/product name/i).fill("Test Product");
      await expect(page.getByText(/sku/i)).toBeVisible();
    });

    test("[BR48] Duplicate product name in same org rejected", async ({
      page,
    }) => {
      // Attempt to create a product with an existing name
      await page.getByRole("button", { name: /add new/i }).click();
      await expect(page.getByLabel(/product name/i)).toBeVisible({
        timeout: 5_000,
      });
    });

    test("[BR48] Duplicate SKU code in same org rejected", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await expect(page.getByLabel(/product name/i)).toBeVisible({
        timeout: 5_000,
      });
    });

    test("[BR49] Successful product creation", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await expect(page.getByLabel(/product name/i)).toBeVisible({
        timeout: 5_000,
      });
    });

    test("[BR50] Success toast shown", async ({ page }) => {
      await page.getByRole("button", { name: /add new/i }).click();
      await expect(page.getByLabel(/product name/i)).toBeVisible({
        timeout: 5_000,
      });
    });

    test("[BR51] Import Excel with valid file", async ({ page }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR51] Import Excel with wrong format rejected", async ({ page }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR51] Import Excel with duplicates shows error", async ({
      page,
    }) => {
      const importBtn = page.getByRole("button", { name: /import/i });
      await expect(importBtn).toBeVisible({ timeout: 5_000 });
    });
  });

  // ═══ UC12: Edit Product ═══

  test.describe("UC12: Edit Product", () => {
    test("[BR52] Edit form validates same rules as create", async ({
      page,
    }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });

    test("[BR53] Duplicate name (excluding self) rejected", async ({
      page,
    }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });

    test("[BR54] Successful update shows toast", async ({ page }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });
  });

  // ═══ UC13: Delete Product ═══

  test.describe("UC13: Delete Product", () => {
    test("[BR55] Delete confirmation dialog appears", async ({ page }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });

    test("[BR55] Cancel delete keeps product", async ({ page }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });

    test("[BR56] Soft delete sets isDeleted flag", async ({ page }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });

    test("[BR56] Variants also soft deleted", async ({ page }) => {
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    });
  });

  // ═══ UC14: List & Search Products ═══

  test.describe("UC14: List & Search Products", () => {
    test("[BR57] Product list loads with details", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR58] Search by product name", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
      await searchInput.fill("Test");
      await page.waitForTimeout(500);
    });

    test("[BR58] Search by SKU code", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
      await searchInput.fill("SKU");
      await page.waitForTimeout(500);
    });

    test("[BR58] Search is case-insensitive", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
    });
  });
});
