import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "../tests/test-helpers";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("blank search shows all bugs @11-search-board AC1", async ({ page, request }) => {
  const first = await bugs.create(request, { title: `search-blank-first-${Date.now()}` });
  const second = await bugs.create(request, { title: `search-blank-second-${Date.now()}` });
  await page.reload();

  await expect(page.getByText(first.title, { exact: true })).toBeVisible();
  await expect(page.getByText(second.title, { exact: true })).toBeVisible();
  await expect(page.getByText("No bugs matched.", { exact: true })).toHaveCount(0);
});
