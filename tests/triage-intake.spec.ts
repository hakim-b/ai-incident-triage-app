import { test, expect } from "@playwright/test";
import { TEST_USER_1, loginViaUI, cleanupIncidents } from "./test-utils";

test.describe("Message Intake & AI Incident Classification", () => {
  const testMessageMarker = "E2E TEST INCIDENT MESSAGE " + Date.now();

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);
  });

  test.afterEach(async () => {
    await cleanupIncidents(TEST_USER_1.id, "E2E TEST INCIDENT MESSAGE");
  });

  test("clicking quick prompt buttons populates the message and source", async ({ page }) => {
    const intakeSection = page.locator("section").filter({ hasText: /New message/i });

    // Test "Calm, still a breach"
    await intakeSection.getByRole("button", { name: "Calm, still a breach" }).click();
    await expect(intakeSection.locator("#source")).toHaveValue("email");
    await expect(intakeSection.locator("#message")).toContainText("title sponsor logo");

    // Test "Missing ribbons"
    await intakeSection.getByRole("button", { name: "Missing ribbons" }).click();
    await expect(intakeSection.locator("#source")).toHaveValue("phone");
    await expect(intakeSection.locator("#message")).toContainText("Logitech G");

    // Test "Loud, but routine"
    await intakeSection.getByRole("button", { name: "Loud, but routine" }).click();
    await expect(intakeSection.locator("#source")).toHaveValue("whatsapp");
    await expect(intakeSection.locator("#message")).toContainText("Secretlab");
  });

  test("classifies incoming sponsor incident and adds it to queue", async ({ page }) => {
    const intakeSection = page.locator("section").filter({ hasText: /New message/i });

    await intakeSection.locator("#source").selectOption("whatsapp");
    await intakeSection.locator("#message").fill(
      `URGENT FROM RED BULL: ${testMessageMarker} - Title logo has vanished from the broadcast feed!`
    );

    // Click Classify
    const classifyBtn = intakeSection.getByRole("button", { name: "Classify" });
    await expect(classifyBtn).toBeEnabled();
    await classifyBtn.click();

    // AI Classification result card should appear
    const resultCard = intakeSection.locator("article");
    await expect(resultCard).toBeVisible({ timeout: 30000 });
    await expect(resultCard.getByRole("heading", { name: "Red Bull" })).toBeVisible();
    await expect(resultCard.getByText("Master Control Switcher", { exact: true })).toBeVisible();
    await expect(resultCard.getByText(/Filed as #/i)).toBeVisible();

    // Verify it appears in the Queue section below
    const queueSection = page.locator("section").filter({ hasText: /^Queue/i });
    await expect(queueSection.getByText(/Red Bull/i).first()).toBeVisible();
  });
});