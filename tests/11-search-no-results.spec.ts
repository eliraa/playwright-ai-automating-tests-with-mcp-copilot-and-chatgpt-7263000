import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("search with no matches shows the empty-results message @11-search-board AC6", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `present-${Date.now()}` });
  await page.reload();
  await page.getByRole("search", { name: "Search bugs by title" }).fill("not-present");

  await expect(page.getByText("No bugs matched.", { exact: true })).toBeVisible();
  await expect(page.getByText(bug.title, { exact: true })).toHaveCount(0);
});
