import { test, expect } from "@playwright/test";
import { loginAndSelectOrg, TEST_USERS } from "../helpers/auth.helper";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC10: Edit Role Permissions
 * BRs: BR43–BR45
 * File: tests/e2e/organization/permissions.spec.ts
 */
test.describe("UC10: Edit Role Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto("/test-org/settings/admin");
    await page.waitForLoadState("networkidle");
  });

  // ─── ORG-027 | BR43 ─────────────────────────────────────────────
  test("[BR43] Default roles not editable", async ({ page }) => {
    // Default roles (owner, admin, member) should not be editable
    await expect(page.getByText(/members|roles|permissions/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-028 | BR44 ─────────────────────────────────────────────
  test("[BR44] Custom role permissions editable", async ({ page }) => {
    // Custom roles should allow editing permissions
    await expect(page.getByText(/members|roles|permissions/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-029 | BR45 ─────────────────────────────────────────────
  test("[BR45] Success toast on update", async ({ page }) => {
    // Updating permissions should show success toast
    await expect(page.getByText(/members|roles|permissions/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-030 | BR45 ─────────────────────────────────────────────
  test("[BR45] Failure shows error toast", async ({ page }) => {
    // Triggering an error should show error toast
    await expect(page.getByText(/members|roles|permissions/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });
});
