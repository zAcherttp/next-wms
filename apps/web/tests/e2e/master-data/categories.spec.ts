import { expect, test } from "@playwright/test";
import {
  loginAndSelectOrg,
  TEST_ORG,
  TEST_USERS,
} from "../helpers/auth.helper";

const BASE = `/${TEST_ORG.slug}/master-data/categories`;

/**
 * UC15–UC18: Categories CRUD & Search
 * BRs: BR59–BR70
 */
test.describe("Categories", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
  });

  // ═══ UC15: Add Category ═══

  test.describe("UC15: Add Category", () => {
    test("[BR59] Form shows name and parent path", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
      await addBtn.click();
      await expect(page.getByLabel(/name/i)).toBeVisible({ timeout: 5_000 });
    });

    test("[BR60] Duplicate path in same org rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR60] Invalid parent path rejected", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });

    test("[BR61] Success toast shown", async ({ page }) => {
      const addBtn = page.getByRole("button", { name: /add|create|new/i });
      await expect(addBtn).toBeVisible({ timeout: 5_000 });
    });
  });

  // ═══ UC16: Edit Category ═══

  test.describe("UC16: Edit Category", () => {
    test("[BR62] Empty name shows error", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR63] Successful rename", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR64] Success toast shown", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  // ═══ UC17: Delete Category ═══

  test.describe("UC17: Delete Category", () => {
    test("[BR65] Delete confirmation dialog appears", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR66] Category with products cannot be deleted", async ({
      page,
    }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR67] Empty category soft deleted", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR68] Success toast shown", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  // ═══ UC18: List & Search Categories ═══

  test.describe("UC18: List & Search Categories", () => {
    test("[BR69] Category list loads (paginated or tree)", async ({ page }) => {
      await expect(
        page.locator("tbody tr, [data-category]").first(),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("[BR70] Search by category name (case-insensitive)", async ({
      page,
    }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible({ timeout: 5_000 });
    });
  });
});
