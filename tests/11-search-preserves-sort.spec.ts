import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("search preserves sorting @11-search-board AC5", async ({ page, request }) => {
  const prefix = `sort-search-${Date.now()}`;
  const titles = [`${prefix}-zulu`, `${prefix}-alpha`];
  for (const title of titles) {
    await bugs.create(request, { title });
  }
  await page.reload();
  await page.getByRole("button", { name: "Title" }).click();
  await page.getByRole("search", { name: "Search bugs by title" }).fill(prefix);

  const matchingRows = page.locator("tbody tr").filter({ hasText: prefix });
  await expect(matchingRows).toHaveCount(2);
  await expect(matchingRows.nth(0)).toContainText(`${prefix}-alpha`);
  await expect(matchingRows.nth(1)).toContainText(`${prefix}-zulu`);
  await expect(page.getByRole("columnheader", { name: /Title/ })).toHaveAttribute("aria-sort", "ascending");
});
