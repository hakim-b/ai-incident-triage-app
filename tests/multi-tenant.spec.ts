import { test, expect } from "@playwright/test";
import {
  TEST_USER_1,
  TEST_USER_2,
  loginViaUI,
  logoutViaUI,
  cleanupSponsor,
} from "./test-utils";

test.describe("Multi-tenant Workspace Isolation", () => {
  const isolatedSponsor = "Isolation Test Brand " + Date.now();

  test.afterAll(async () => {
    await cleanupSponsor(TEST_USER_1.id, isolatedSponsor);
  });

  test("sponsors added by User 1 are isolated from User 2", async ({ page }) => {
    // 1. Log in as User 1
    await loginViaUI(page, TEST_USER_1);
    const matrix1 = page.locator("aside");

    // Add unique sponsor for User 1
    await matrix1.getByRole("button", { name: /add sponsor/i }).click();
    await matrix1.locator('input[name="name"]').fill(isolatedSponsor);
    await matrix1.locator('select[name="tier"]').selectOption("1");
    await matrix1.locator('input[name="aliases"]').fill("isolation, testbrand");
    await matrix1
      .locator('textarea[name="obligation"]')
      .fill("Exclusive Title partner for User 1 tenant.");
    await matrix1.getByRole("button", { name: /save sponsor/i }).click();

    // Verify it is visible for User 1
    await expect(matrix1.getByText(isolatedSponsor)).toBeVisible({ timeout: 10000 });

    // 2. Sign out of User 1
    await logoutViaUI(page);

    // 3. Log in as User 2
    await loginViaUI(page, TEST_USER_2);
    const matrix2 = page.locator("aside");

    // Verify User 2 does NOT see User 1's custom sponsor
    await expect(matrix2.getByText(isolatedSponsor)).not.toBeVisible();

    // Verify User 2 still has their baseline sponsors
    await expect(matrix2.getByText("Red Bull")).toBeVisible();
    await expect(matrix2.getByText("Logitech G")).toBeVisible();
    await expect(matrix2.getByText("Secretlab")).toBeVisible();

    // 4. Sign out of User 2 and sign back in to User 1
    await logoutViaUI(page);
    await loginViaUI(page, TEST_USER_1);

    // User 1 still sees their sponsor
    await expect(page.locator("aside").getByText(isolatedSponsor)).toBeVisible();
  });
});