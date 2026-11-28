import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "../tests/test-helpers";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("clear search restores all bugs @11-search-board AC4", async ({ page, request }) => {
  const matching = await bugs.create(request, { title: `filter-match-${Date.now()}` });
  const other = await bugs.create(request, { title: `filter-other-${Date.now()}` });
  await page.reload();
  const search = page.getByRole("search", { name: "Search bugs by title" });
  await search.fill("filter-match");
  await page.getByRole("button", { name: "Clear search" }).click();

  await expect(search).toHaveValue("");
  await expect(page.getByText(matching.title, { exact: true })).toBeVisible();
  await expect(page.getByText(other.title, { exact: true })).toBeVisible();
});
