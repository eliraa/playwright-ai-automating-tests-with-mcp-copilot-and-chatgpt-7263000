import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("search normalizes case, whitespace, and punctuation @11-search-board AC3", async ({ page, request }) => {
  const loginTitle = await bugs.create(request, { title: `Login fails ${Date.now()}` });
  const hyphenatedTitle = await bugs.create(request, { title: `Issue with log-in ${Date.now()}` });
  const other = await bugs.create(request, { title: `Checkout issue ${Date.now()}` });
  await page.reload();
  await page.getByRole("search", { name: "Search bugs by title" }).fill("login");

  await expect(page.getByText(loginTitle.title, { exact: true })).toBeVisible();
  await expect(page.getByText(hyphenatedTitle.title, { exact: true })).toBeVisible();
  await expect(page.getByText(other.title, { exact: true })).toHaveCount(0);
});
