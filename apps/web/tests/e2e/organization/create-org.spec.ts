import { expect, test } from "@playwright/test";
import { login, TEST_USERS } from "../helpers/auth.helper";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC06: Create Organization
 * BRs: BR26–BR32
 * File: tests/e2e/organization/create-org.spec.ts
 */
test.describe("UC06: Create Organization", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
    await page.waitForURL("**/(dashboard|join|onboarding)**", {
      timeout: 15_000,
    });
  });

  // ─── ORG-006 | BR26 ─────────────────────────────────────────────
  test("[BR26] Form shows name, slug, logo fields", async ({ page }) => {
    // Open the create organization dialog
    // Navigate to /join page where "Add Organization" dialog can be triggered
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    // Look for "Create" or "Add" organization button
    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // Look for the "Create organization" item in dialog
    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) {
      await createItem.click();
    }

    // Verify form fields
    await expect(page.getByLabel(/organization name/i)).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByLabel(/organization slug/i)).toBeVisible();
    await expect(page.getByText(/logo/i)).toBeVisible();
  });

  // ─── ORG-007 | BR27 ─────────────────────────────────────────────
  test("[BR27] Empty name shows error", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    // Leave name empty, fill slug
    await page.getByLabel(/organization slug/i).fill("test-slug");
    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(/organization name is required/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-008 | BR27 ─────────────────────────────────────────────
  test("[BR27] Invalid name chars show error", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    await page.getByLabel(/organization name/i).fill("Test@#$%^&*");
    await page.getByLabel(/organization slug/i).fill("valid-slug");
    await page.getByRole("button", { name: /create/i }).click();

    await expect(
      page.getByText(/can only contain letters, numbers, spaces, and hyphens/i),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-009 | BR27 ─────────────────────────────────────────────
  test("[BR27] Empty slug shows error", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    await page.getByLabel(/organization name/i).fill("Valid Name");
    // Leave slug empty
    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(/organization slug is required/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  // ─── ORG-010 | BR27 ─────────────────────────────────────────────
  test("[BR27] Invalid slug format shows error", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    await page.getByLabel(/organization name/i).fill("Valid Name");
    await page.getByLabel(/organization slug/i).fill("UPPER CASE!!!");
    await page.getByRole("button", { name: /create/i }).click();

    await expect(
      page.getByText(
        /can only contain lowercase letters, numbers, and hyphens/i,
      ),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ─── ORG-011 | BR28 ─────────────────────────────────────────────
  test("[BR28] Duplicate slug shows error", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    await page.getByLabel(/organization name/i).fill("Duplicate Test");
    await page.getByLabel(/organization slug/i).fill("test-org"); // existing slug
    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(/already taken/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─── ORG-012 | BR30 ─────────────────────────────────────────────
  test("[BR30] Successful org creation", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    const uniqueSlug = `e2e-org-${Date.now()}`;
    await page.getByLabel(/organization name/i).fill("E2E Test Org");
    await page.getByLabel(/organization slug/i).fill(uniqueSlug);
    await page.getByRole("button", { name: /create/i }).click();

    // Org created — verify toast appears (creation succeeded)
    await expect(page.locator(TOAST_SELECTOR)).toBeVisible({
      timeout: 15_000,
    });
  });

  // ─── ORG-014 | BR32 ─────────────────────────────────────────────
  test("[BR32] Success toast shown", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    const uniqueSlug = `e2e-toast-${Date.now()}`;
    await page.getByLabel(/organization name/i).fill("E2E Toast Org");
    await page.getByLabel(/organization slug/i).fill(uniqueSlug);
    await page.getByRole("button", { name: /create/i }).click();

    // MSG18 — "Organization created successfully"
    await expect(page.locator(TOAST_SELECTOR)).toContainText(
      /organization created successfully/i,
    );
  });

  // ─── ORG-013 | BR31 ─────────────────────────────────────────────
  test("[BR31] Redirects to new org dashboard", async ({ page }) => {
    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", {
      name: /create.*organization|add.*organization/i,
    });
    if (await addBtn.isVisible()) await addBtn.click();

    const createItem = page.getByText(/create organization/i);
    if (await createItem.isVisible()) await createItem.click();

    const uniqueSlug = `e2e-redir-${Date.now()}`;
    await page.getByLabel(/organization name/i).fill("E2E Redirect Org");
    await page.getByLabel(/organization slug/i).fill(uniqueSlug);
    await page.getByRole("button", { name: /create/i }).click();

    // After creation, should redirect to new org dashboard
    await page.waitForURL(`**/${uniqueSlug}/dashboard**`, {
      timeout: 20_000,
    });
    expect(page.url()).toContain(`/${uniqueSlug}/dashboard`);
  });
});
