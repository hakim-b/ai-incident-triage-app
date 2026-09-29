import { test, expect } from "@playwright/test";
import { TEST_USER_1, loginViaUI } from "./test-utils";

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);
  });

  test("toggles theme between light and dark", async ({ page }) => {
    const themeBtn = page.getByRole("button", { name: "Toggle theme" });
    await expect(themeBtn).toBeVisible();

    // 1. Switch to Dark
    await themeBtn.click();
    await page.getByRole("menuitem", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 2. Switch to Light
    await themeBtn.click();
    await page.getByRole("menuitem", { name: "Light" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});