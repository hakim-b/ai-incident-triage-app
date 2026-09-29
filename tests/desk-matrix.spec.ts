import { test, expect } from "@playwright/test";
import { TEST_USER_1, loginViaUI, cleanupSponsor } from "./test-utils";

test.describe("Contract Matrix Management", () => {
  const customSponsor = "HyperX Gaming";

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);
  });

  test.afterEach(async () => {
    await cleanupSponsor(TEST_USER_1.id, customSponsor);
  });

  test("displays default seed sponsors and tier routes guide", async ({ page }) => {
    const matrix = page.locator("aside");
    await expect(matrix.getByRole("heading", { name: "Contract matrix" })).toBeVisible();

    // Verify seed sponsors
    await expect(matrix.getByText("Red Bull")).toBeVisible();
    await expect(matrix.getByText("Logitech G")).toBeVisible();
    await expect(matrix.getByText("Secretlab")).toBeVisible();

    // Verify routing rules guide
    await expect(matrix.getByText(/Master Control Switcher/i)).toBeVisible();
    await expect(matrix.getByText(/Motion Graphics Lead/i)).toBeVisible();
    await expect(matrix.getByText(/Post-Match Queue/i)).toBeVisible();
  });

  test("toggles add sponsor form with open, cancel and close buttons", async ({ page }) => {
    const matrix = page.locator("aside");
    const addBtn = matrix.getByRole("button", { name: /add sponsor/i });

    // Open form
    await addBtn.click();
    await expect(matrix.getByRole("heading", { name: "Add new sponsor" })).toBeVisible();

    // Close via Close button (X)
    await matrix.getByLabel("Close form").click();
    await expect(matrix.getByRole("heading", { name: "Add new sponsor" })).not.toBeVisible();

    // Reopen and cancel
    await addBtn.click();
    await matrix.getByRole("button", { name: "Cancel" }).click();
    await expect(matrix.getByRole("heading", { name: "Add new sponsor" })).not.toBeVisible();
  });

  test("successfully adds a new sponsor to the contract matrix", async ({ page }) => {
    const matrix = page.locator("aside");
    await matrix.getByRole("button", { name: /add sponsor/i }).click();

    await matrix.locator('input[name="name"]').fill(customSponsor);
    await matrix.locator('select[name="tier"]').selectOption("2");
    await matrix.locator('input[name="aliases"]').fill("hyperx, hyper x");
    await matrix
      .locator('textarea[name="obligation"]')
      .fill("Broadcast partner. Headset product placement on analyst desk and audio stingers.");

    await matrix.getByRole("button", { name: /save sponsor/i }).click();

    // Should appear in the matrix list
    await expect(matrix.getByText(customSponsor)).toBeVisible({ timeout: 10000 });
    await expect(matrix.getByText(/Headset product placement/i)).toBeVisible();
  });

  test("shows error when adding a duplicate sponsor name", async ({ page }) => {
    const matrix = page.locator("aside");
    await matrix.getByRole("button", { name: /add sponsor/i }).click();

    // Attempt to add Red Bull which already exists
    await matrix.locator('input[name="name"]').fill("Red Bull");
    await matrix.locator('select[name="tier"]').selectOption("1");
    await matrix
      .locator('textarea[name="obligation"]')
      .fill("Duplicate test obligation text for Red Bull.");

    await matrix.getByRole("button", { name: /save sponsor/i }).click();

    const alert = matrix.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText(/already exists/i);
  });
});