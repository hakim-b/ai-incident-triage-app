import { type Page, expect } from "@playwright/test";
import { sql } from "drizzle-orm";
import { db } from "~/db";

export const TEST_USER_1 = {
  email: "hakimbouabdellah02@gmail.com",
  password: "TestPassword123!",
  id: "6b668bc2-c7a6-4779-a1fc-3ee75783a42b",
};

export const TEST_USER_2 = {
  email: "hakimbouabdellah02@outlook.com",
  password: "TestPassword123!",
  id: "6e227e5f-d702-4bc6-a0ad-4da316105117",
};

/**
 * Log in a user via the UI form and wait for the desk to load.
 */
export async function loginViaUI(
  page: Page,
  user: { email: string; password: string } = TEST_USER_1,
) {
  await page.goto("/auth/login");
  await page.waitForLoadState("domcontentloaded");

  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Should navigate to "/"
  await page.waitForURL("/", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Delivery Desk" })).toBeVisible();
}

/**
 * Log out the currently authenticated user via the user avatar dropdown menu.
 */
export async function logoutViaUI(page: Page) {
  await page.getByLabel("User account menu").click();
  await page.getByRole("menuitem", { name: /sign out/i }).click();
  await page.waitForURL("/auth/login", { timeout: 15000 });
}

/**
 * Clean up a test sponsor from the database.
 */
export async function cleanupSponsor(userId: string, sponsorName: string) {
  await db.execute(sql`
    DELETE FROM sponsors WHERE user_id = ${userId}::uuid AND name = ${sponsorName}
  `);
}

/**
 * Clean up test incidents from the database.
 */
export async function cleanupIncidents(userId: string, rawMessageSubstring: string) {
  await db.execute(sql`
    DELETE FROM incidents WHERE user_id = ${userId}::uuid AND raw_message ILIKE ${`%${rawMessageSubstring}%`}
  `);
}