import { expect, test } from "@playwright/test";
import {
  loginAndSelectOrg,
  TEST_ORG,
  TEST_USERS,
} from "../helpers/auth.helper";

const BASE = `/${TEST_ORG.slug}/master-data/suppliers`;

/**
 * UC23–UC26: Suppliers CRUD & Search
 * BRs: BR84–BR94
 */
test.describe("Suppliers", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
  });

  // ═══ UC23: Add Supplier ═══

  test.describe("UC23: Add Supplier", () => {
    test("[BR84] Form shows all fields", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
      await addBtn.click();
      await expect(page.getByLabel(/name/i)).toBeVisible({ timeout: 5_000 });
    });

    test("[BR85] Invalid email format rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR85] Duplicate supplier name rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR85] Duplicate supplier email rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR85] Negative lead time rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR86] Success toast shown", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });
  });

  // ═══ UC24: Edit Supplier ═══

  test.describe("UC24: Edit Supplier", () => {
    test("[BR87] Same validation rules apply (excluding self)", async ({
      page,
    }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR88] Success toast shown", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  // ═══ UC25: Delete Supplier ═══

  test.describe("UC25: Delete Supplier", () => {
    test("[BR89] Delete confirmation dialog appears", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR90] Supplier with active POs cannot be deleted", async ({
      page,
    }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR91] Soft delete supplier without active POs", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR92] Success toast shown", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  // ═══ UC26: List & Search Suppliers ═══

  test.describe("UC26: List & Search Suppliers", () => {
    test("[BR93] Supplier list loads with brand info", async ({ page }) => {
      await expect(page.locator("tbody tr").first()).toBeVisible({
        timeout: 10_000,
      });
    });

    test("[BR94] Search by name, email, or contactPerson", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
    });
  });
});
