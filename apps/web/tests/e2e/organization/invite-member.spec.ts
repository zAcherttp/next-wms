import { test, expect } from "@playwright/test";
import { loginAndSelectOrg, TEST_USERS } from "../helpers/auth.helper";
import { TOAST_SELECTOR, DIALOG_SELECTOR } from "../helpers/constants";

/**
 * UC07: Invite Member
 * BRs: BR33–BR36
 * File: tests/e2e/organization/invite-member.spec.ts
 */
test.describe("UC07: Invite Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    // Navigate to admin settings where invite form is
    await page.goto(`/test-org/settings/admin`);
    await page.waitForLoadState("networkidle");
  });

  // ─── ORG-015 | BR33 ─────────────────────────────────────────────
  test("[BR33] Form shows email and role fields", async ({ page }) => {
    // Look for invite button to open the dialog
    const inviteBtn = page.getByRole("button", {
      name: /invite|add member/i,
    });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
    }

    // Verify email input and role selector
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByLabel(/role/i)).toBeVisible();
  });

  // ─── ORG-016 | BR34 ─────────────────────────────────────────────
  test("[BR34] Empty email shows error", async ({ page }) => {
    const inviteBtn = page.getByRole("button", {
      name: /invite|add member/i,
    });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
    }

    // Leave email empty, click send
    await page.getByRole("button", { name: /send invitation/i }).click();

    await expect(
      page.getByText(/valid email/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-017 | BR34 ─────────────────────────────────────────────
  test("[BR34] Invalid email shows error", async ({ page }) => {
    const inviteBtn = page.getByRole("button", {
      name: /invite|add member/i,
    });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
    }

    await page.getByLabel(/email/i).fill("bad");
    await page.getByLabel(/email/i).blur();

    await expect(
      page.getByText(/valid email/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-018 | BR36 ─────────────────────────────────────────────
  test("[BR36] Successful invitation shows toast", async ({ page }) => {
    const inviteBtn = page.getByRole("button", {
      name: /invite|add member/i,
    });
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
    }

    const uniqueEmail = `invite-e2e-${Date.now()}@test.com`;
    await page.getByLabel(/email/i).fill(uniqueEmail);

    // Select role
    await page.getByLabel(/role/i).click();
    await page.getByRole("option", { name: /member/i }).click();

    await page.getByRole("button", { name: /send invitation/i }).click();

    await expect(page.locator(TOAST_SELECTOR)).toContainText(
      /invitation sent/i
    );
  });
});
