import { test, expect } from "@playwright/test";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC01: Login
 * BRs: BR01–BR06
 * File: tests/e2e/auth/login.spec.ts
 */
test.describe("UC01: Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("networkidle");
  });

  // ─── AUTH-001 | BR01 ─────────────────────────────────────────────
  test("[BR01] Form displays required fields", async ({ page }) => {
    // Email input visible
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Password input visible
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Remember me checkbox visible
    await expect(page.getByLabel(/remember me/i)).toBeVisible();

    // Login button visible
    await expect(
      page.getByRole("button", { name: /login/i })
    ).toBeVisible();
  });

  // ─── AUTH-002 | BR02 ─────────────────────────────────────────────
  test("[BR02] Empty email shows error", async ({ page }) => {
    // Leave email empty, click Login
    await page.getByRole("button", { name: /login/i }).click();

    // Error message for email field should appear
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  // ─── AUTH-003 | BR02 ─────────────────────────────────────────────
  test("[BR02] Invalid email format shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("notanemail");
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  // ─── AUTH-004 | BR02 ─────────────────────────────────────────────
  test("[BR02] Empty password shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("valid@email.com");
    // Leave password empty
    await page.getByRole("button", { name: /login/i }).click();

    await expect(
      page.getByText(/password must be at least 8 characters/i)
    ).toBeVisible();
  });

  // ─── AUTH-005 | BR02 ─────────────────────────────────────────────
  test("[BR02] Short password shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("valid@email.com");
    await page.getByLabel(/password/i).fill("123");
    await page.getByRole("button", { name: /login/i }).click();

    await expect(
      page.getByText(/password must be at least 8 characters/i)
    ).toBeVisible();
  });

  // ─── AUTH-006 | BR03 ─────────────────────────────────────────────
  test("[BR03] Non-existent email shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("ghost@fake.com");
    await page.getByLabel(/password/i).fill("ValidPass123!");
    await page.getByRole("button", { name: /login/i }).click();

    // Error toast from Better Auth
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── AUTH-007 | BR03 ─────────────────────────────────────────────
  test("[BR03] Wrong password shows error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("owner@test.com");
    await page.getByLabel(/password/i).fill("WrongPassword1!");
    await page.getByRole("button", { name: /login/i }).click();

    // Error toast from Better Auth
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── AUTH-008 | BR04 ─────────────────────────────────────────────
  test("[BR04] Successful login shows success toast", async ({ page }) => {
    await page.getByLabel(/email/i).fill("owner@test.com");
    await page.getByLabel(/password/i).fill("Test1234!");
    await page.getByRole("button", { name: /login/i }).click();

    // Toast MSG01 — "Successfully signed in"
    await expect(page.locator(TOAST_SELECTOR)).toContainText(
      /successfully signed in/i
    );
  });

  // ─── AUTH-009 | BR05 ─────────────────────────────────────────────
  test("[BR05] Successful login redirects to onboarding", async ({ page }) => {
    await page.getByLabel(/email/i).fill("owner@test.com");
    await page.getByLabel(/password/i).fill("Test1234!");
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForURL("**/auth/onboarding**", { timeout: 15_000 });
    expect(page.url()).toContain("/auth/onboarding");
  });

  // ─── AUTH-010 | BR06 ─────────────────────────────────────────────
  test("[BR06] Unverified email shows verify link", async ({ page }) => {
    // Assumes an unverified test account exists
    await page.getByLabel(/email/i).fill("unverified@test.com");
    await page.getByLabel(/password/i).fill("Test1234!");
    await page.getByRole("button", { name: /login/i }).click();

    // Toast should contain "Verify now" action button
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.locator(TOAST_SELECTOR).getByRole("button", { name: /verify now/i })
    ).toBeVisible();
  });
});
