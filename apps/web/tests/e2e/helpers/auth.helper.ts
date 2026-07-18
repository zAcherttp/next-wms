import type { Page } from "@playwright/test";

export const TEST_USERS = {
  owner: { email: "owner@test.com", password: "Test1234!" },
  admin: { email: "admin@test.com", password: "Test1234!" },
  member: { email: "member@test.com", password: "Test1234!" },
};

export const TEST_ORG = {
  name: "Test Organization",
  slug: "test-org",
};

export async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL("**/onboarding**", { timeout: 15_000 });
}

export async function loginAndSelectOrg(page: Page, user = TEST_USERS.owner) {
  await login(page, user.email, user.password);
  await page.getByText(TEST_ORG.name).click();
  await page.getByRole("button", { name: /open/i }).click();
  await page.waitForURL(`**/${TEST_ORG.slug}/dashboard**`, { timeout: 15_000 });
}
