import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "../tests/test-helpers";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("search filters bugs by title @11-search-board AC2", async ({ page, request }) => {
  const matching = await bugs.create(request, { title: `login-${Date.now()}` });
  const other = await bugs.create(request, { title: `checkout-${Date.now()}` });
  await page.reload();
  await page.getByRole("search", { name: "Search bugs by title" }).fill("login");

  await expect(page.getByText(matching.title, { exact: true })).toBeVisible();
  await expect(page.getByText(other.title, { exact: true })).toHaveCount(0);
});
