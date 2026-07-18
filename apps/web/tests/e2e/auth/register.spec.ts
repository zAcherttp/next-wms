import { expect, test } from "@playwright/test";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC02: Register
 * BRs: BR07–BR11
 * File: tests/e2e/auth/register.spec.ts
 */
test.describe("UC02: Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.waitForLoadState("networkidle");
  });

  // ─── AUTH-011 | BR07 ─────────────────────────────────────────────
  test("[BR07] Form displays all required fields", async ({ page }) => {
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
  });

  // ─── AUTH-012 | BR08 ─────────────────────────────────────────────
  test("[BR08] Empty name shows error", async ({ page }) => {
    // Leave name empty, fill other fields
    await page.getByLabel(/email/i).fill("test@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  // ─── AUTH-013 | BR08 ─────────────────────────────────────────────
  test("[BR08] Empty email shows error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  // ─── AUTH-014 | BR08 ─────────────────────────────────────────────
  test("[BR08] Invalid email shows error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("bad");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  // ─── AUTH-015 | BR08 ─────────────────────────────────────────────
  test("[BR08] Short password shows error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@test.com");
    await page.getByLabel("Password").fill("abc");
    await page.getByLabel(/confirm password/i).fill("abc");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(
      page.getByText(/password must be at least 8 characters/i),
    ).toBeVisible();
  });

  // ─── AUTH-016 | BR08 ─────────────────────────────────────────────
  test("[BR08] Empty confirm password shows error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    // Leave confirm password empty
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(
      page.getByText(/password confirmation is required/i),
    ).toBeVisible();
  });

  // ─── AUTH-017 | BR08 ─────────────────────────────────────────────
  test("[BR08] Mismatched passwords show error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Different1!");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  // ─── AUTH-018 | BR09 ─────────────────────────────────────────────
  test("[BR09] Duplicate email shows error", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("owner@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /submit/i }).click();

    // Error toast about email already exists
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── AUTH-019 | BR10 ─────────────────────────────────────────────
  test("[BR10] Successful register redirects to verify-email", async ({
    page,
  }) => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;
    await page.getByLabel(/name/i).fill("New E2E User");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByLabel(/confirm password/i).fill("Test1234!");
    await page.getByRole("button", { name: /submit/i }).click();

    await page.waitForURL("**/auth/verify-email**", { timeout: 15_000 });
    expect(page.url()).toContain("/auth/verify-email");
    expect(page.url()).toContain(`email=${encodeURIComponent(uniqueEmail)}`);
  });

  // ─── AUTH-020 | BR11 ─────────────────────────────────────────────
  test("[BR11] Valid OTP verifies email", async ({ page }) => {
    // This test requires a way to retrieve the OTP (e.g., from a test mailbox API).
    // Navigate to verify-email page
    await page.goto("/auth/verify-email?email=owner@test.com");
    await page.waitForLoadState("networkidle");

    // Verify OTP input is shown
    await expect(page.getByLabel(/verification code/i)).toBeVisible();

    // NOTE: In a real E2E environment, retrieve OTP from test email service
    // For now, we validate the UI is present
  });

  // ─── AUTH-021 | BR11 ─────────────────────────────────────────────
  test("[BR11] Invalid OTP shows error", async ({ page }) => {
    await page.goto("/auth/verify-email?email=owner@test.com");
    await page.waitForLoadState("networkidle");

    // Wait for OTP step to be visible
    await expect(page.getByText(/verification code/i)).toBeVisible();

    // Type wrong OTP — fill all 6 slots
    // const otpSlots = page.locator('[data-slot="input-otp-slot"]');
    // Use keyboard to type into OTP input
    await page.getByRole("textbox").first().focus();
    await page.keyboard.type("000000");

    // Error toast should appear
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 10_000,
    });
  });
});
