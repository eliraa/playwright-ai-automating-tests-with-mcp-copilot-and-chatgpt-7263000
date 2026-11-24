import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("edit modal exposes a Delete button @12-delete-bug AC1", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `delete-button-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Delete" })).toBeVisible();
});

test("deleting a bug removes it and closes the modal @12-delete-bug AC2", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `delete-me-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  // Stop tracking the id: afterEach cleanup would otherwise fail trying to delete a bug that is already gone.
  bugs.forget(bug.id);

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText(bug.title, { exact: true })).toHaveCount(0);
  // Expect 404 from the API: the row disappearing from the UI does not prove it was deleted server-side.
  const response = await request.get(`/api/bugs/${bug.id}`);
  expect(response.status()).toBe(404);
});
