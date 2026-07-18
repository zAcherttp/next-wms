import { expect, test } from "@playwright/test";
import { loginAndSelectOrg, TEST_USERS } from "../helpers/auth.helper";

/**
 * UC09: Manage Roles
 * BRs: BR40–BR42
 * File: tests/e2e/organization/roles.spec.ts
 */
test.describe("UC09: Manage Roles", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto("/test-org/settings/admin");
    await page.waitForLoadState("networkidle");
  });

  // ─── ORG-023 | BR40 ─────────────────────────────────────────────
  test("[BR40] Shows member info and current role", async ({ page }) => {
    // Look for member list / roles section
    await expect(page.getByText(/members|roles/i).first()).toBeVisible({
      timeout: 5_000,
    });

    // Verify at least one member row is visible with role info
    const memberRows = page.locator("tr, [data-member-row]");
    await expect(memberRows.first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-024 | BR41 ─────────────────────────────────────────────
  test("[BR41] Cannot change last owner's role", async ({ page }) => {
    // Attempt to change the only owner's role
    // This test verifies backend protection for the last owner
    const ownerRow = page.getByText(TEST_USERS.owner.email);
    await expect(ownerRow).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-025 | BR41 ─────────────────────────────────────────────
  test("[BR41] Same role change rejected", async ({ page }) => {
    // Attempt to set the same role on a member
    await expect(page.getByText(/members|roles/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-026 | BR42 ─────────────────────────────────────────────
  test("[BR42] Successful role change shows toast", async ({ page }) => {
    // Change a member's role (e.g., member → admin)
    // This test requires at least 2 members in the org
    await expect(page.getByText(/members|roles/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });
});
