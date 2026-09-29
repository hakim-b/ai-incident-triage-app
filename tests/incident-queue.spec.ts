import { test, expect } from "@playwright/test";
import { TEST_USER_1, loginViaUI } from "./test-utils";

test.describe("Queue & Incident Lifecycle Management", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);
  });

  test("displays queue items with expandable original message details", async ({ page }) => {
    const queueSection = page.locator("section").filter({ hasText: /^Queue/i });
    await expect(queueSection).toBeVisible();

    const firstItem = queueSection.locator("ol > li").first();
    await expect(firstItem).toBeVisible();

    // Verify details expander
    const details = firstItem.locator("details");
    await expect(details.locator("summary")).toHaveText(/Original message/i);

    // Expand details and check text
    await details.locator("summary").click();
    await expect(details.locator("p").first()).toBeVisible();
  });

  test("transitions incident lifecycle: Open -> Acknowledge -> Resolve -> Reopen", async ({ page }) => {
    const queueSection = page.locator("section").filter({ hasText: /^Queue/i });
    const firstItem = queueSection.locator("ol > li").first();

    // Check if the item is currently open, acknowledged or resolved
    // If it's already resolved or acknowledged, reset to open first via Reopen
    const reopenBtn = firstItem.getByRole("button", { name: "Reopen" });
    if (await reopenBtn.isVisible()) {
      await reopenBtn.click();
      await page.waitForLoadState("domcontentloaded");
    }

    // Now it should be Open
    await expect(firstItem.getByText("Open")).toBeVisible();
    await expect(firstItem.getByRole("button", { name: "Acknowledge" })).toBeVisible();
    await expect(firstItem.getByRole("button", { name: "Resolve" })).toBeVisible();

    // 1. Click Acknowledge
    await firstItem.getByRole("button", { name: "Acknowledge" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(firstItem.getByText("Acknowledged")).toBeVisible({ timeout: 10000 });
    await expect(firstItem.getByRole("button", { name: "Resolve" })).toBeVisible();
    await expect(firstItem.getByRole("button", { name: "Reopen" })).toBeVisible();

    // 2. Click Resolve
    await firstItem.getByRole("button", { name: "Resolve" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(firstItem.getByText("Resolved")).toBeVisible({ timeout: 10000 });
    await expect(firstItem.getByRole("button", { name: "Reopen" })).toBeVisible();

    // 3. Click Reopen
    await firstItem.getByRole("button", { name: "Reopen" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(firstItem.getByText("Open")).toBeVisible({ timeout: 10000 });
  });
});