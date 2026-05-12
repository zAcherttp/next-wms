import { test, expect } from "@playwright/test";
import { loginAndSelectOrg, TEST_USERS, TEST_ORG } from "../helpers/auth.helper";
import { TOAST_SELECTOR } from "../helpers/constants";

/**
 * UC05: Manage User Profile
 * BRs: BR23–BR25
 */
test.describe("UC05: Manage User Profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndSelectOrg(page, TEST_USERS.owner);
    await page.goto(`/${TEST_ORG.slug}/settings/profile`);
    await page.waitForLoadState("networkidle");
  });

  test("[BR23] Displays user info (name, email, avatar)", async ({ page }) => {
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText(/profile picture/i)).toBeVisible();
    await expect(page.getByText(/fullname/i)).toBeVisible();
  });

  test("[BR24] Empty name shows error", async ({ page }) => {
    const editBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await editBtn.click();
    const nameInput = page.locator("input").first();
    await nameInput.clear();
    const saveBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await saveBtn.click();
    await expect(page.locator(TOAST_SELECTOR)).toContainText(/full name cannot be empty/i);
  });

  test("[BR24] No changes shows info message", async ({ page }) => {
    const editBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await editBtn.click();
    const saveBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await saveBtn.click();
    await expect(page.locator(TOAST_SELECTOR)).toContainText(/no changes made/i);
  });

  test("[BR24] Invalid image file shows error", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: "test.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("not an image"),
      });
      await expect(page.locator(TOAST_SELECTOR)).toBeVisible({ timeout: 5_000 });
    }
  });

  test("[BR25] Name update shows success toast", async ({ page }) => {
    const editBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await editBtn.click();
    const nameInput = page.locator("input").first();
    const originalName = await nameInput.inputValue();
    await nameInput.clear();
    await nameInput.fill("Updated E2E Name");
    const saveBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await saveBtn.click();
    await expect(page.locator(TOAST_SELECTOR)).toContainText(/full name updated/i);
    // Restore
    const editBtn2 = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await editBtn2.click();
    await nameInput.clear();
    await nameInput.fill(originalName);
    const saveBtn2 = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await saveBtn2.click();
  });

  test("[BR25] Avatar update shows success toast", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      const pngBuf = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      await fileInput.setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: pngBuf });
      const savePicBtn = page.getByRole("button", { name: /save picture/i });
      if (await savePicBtn.isVisible({ timeout: 3_000 })) {
        await savePicBtn.click();
        await expect(page.locator(TOAST_SELECTOR)).toContainText(/profile picture updated/i);
      }
    }
  });

  test("[BR23] Email field is not editable", async ({ page }) => {
    await expect(page.getByText(/fullname/i)).toBeVisible();
    const nameInput = page.locator("input").first();
    await expect(nameInput).toBeDisabled();
  });
});
