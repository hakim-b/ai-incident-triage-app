import { test, expect } from "@playwright/test";
import { TEST_USER_1, loginViaUI, logoutViaUI } from "./test-utils";

test.describe("Authentication & Session Guarding", () => {
  test("unauthenticated users are redirected from / to /auth/login", async ({ page }) => {
    // Ensure clear context (no cookies)
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForURL("/auth/login", { timeout: 10000 });
    await expect(page).toHaveTitle(/Sign In - Delivery Desk/i);
    await expect(page.getByRole("heading", { name: "Delivery Desk" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows validation error on invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "invalid.user@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    const alert = page.locator('div[role="alert"]:not(#__next-route-announcer__)');
    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText(/invalid/i);
  });

  test("navigates to sign up page and displays form fields", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("link", { name: /sign up/i }).click();
    await page.waitForURL("/auth/sign-up", { timeout: 10000 });

    await expect(page).toHaveTitle(/Sign Up - Delivery Desk/i);
    await expect(page.getByRole("heading", { name: "Create an Account" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("successful login lands on desk and sign out returns to login", async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);

    // Verify desk elements
    await expect(page.getByRole("heading", { name: "Delivery Desk" })).toBeVisible();
    await expect(page.getByLabel("User account menu")).toBeVisible();

    // Sign out
    await logoutViaUI(page);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("authenticated user visiting /auth/login is redirected to /", async ({ page }) => {
    await loginViaUI(page, TEST_USER_1);
    await page.goto("/auth/login");
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Delivery Desk" })).toBeVisible();
  });
});