import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("logout redirects to login @05-logout AC1", async ({ page }) => {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("logged-out users cannot reopen the board @05-logout AC2", async ({ page }) => {
  await page.getByRole("button", { name: "Logout" }).click();
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login$/);
});

test("browser back after logout does not restore authentication @05-logout AC3", async ({ page }) => {
  await page.getByRole("button", { name: "Logout" }).click();
  // goBack simulates the browser Back button, which can restore a cached /board page;
  // page.goto would always re-run the auth guard and hide that bug.
  await page.goBack();
  await expect(page).not.toHaveURL(/\/board$/);
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login$/);
});

test("logged-out protected-page navigation redirects to login @05-logout AC4", async ({ page }) => {
  await page.getByRole("button", { name: "Logout" }).click();
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login$/);
});
