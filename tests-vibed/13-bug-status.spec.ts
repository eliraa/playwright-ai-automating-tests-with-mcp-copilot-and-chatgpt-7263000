import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "../tests/test-helpers";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("new bugs start Open and appear in the Open view @13-bug-status AC1", async ({ page }) => {
  const title = `new-open-${Date.now()}`;
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Severity").selectOption("mid");
  await dialog.getByLabel("Owner").fill("status-owner");
  await dialog.getByLabel("Description").fill("Open by default.");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("edit modal can change a bug's state @13-bug-status AC2", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `edit-state-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("State")).toHaveValue("open");
  await dialog.getByLabel("State").selectOption("closed");
  await dialog.getByRole("button", { name: "Save" }).click();
  // Check the stored state through the API (the server returns it uppercased) instead of the UI,
  // since the Open view hides closed bugs.
  const response = await request.get(`/api/bugs/${bug.id}`);
  expect((await response.json()).state).toBe("CLOSED");
});

test("Open is the default board state filter @13-bug-status AC3", async ({ page, request }) => {
  const open = await bugs.create(request, { title: `open-default-${Date.now()}` });
  const closed = await bugs.create(request, { title: `closed-default-${Date.now()}` });
  // Close the bug through the API: faster and independent of the edit modal, which has its own test (AC2).
  await request.put(`/api/bugs/${closed.id}`, {
    data: { ...closed, state: "closed" },
  });
  await page.reload();
  // The filter buttons expose no aria-pressed, so the active style class is the only observable selected state.
  await expect(page.getByRole("button", { name: "Open", exact: true })).toHaveClass(/bg-primary/);
  await expect(page.getByText(open.title, { exact: true })).toBeVisible();
  await expect(page.getByText(closed.title, { exact: true })).toHaveCount(0);
});

test("Closed filter shows only closed bugs @13-bug-status AC4", async ({ page, request }) => {
  const open = await bugs.create(request, { title: `open-filter-${Date.now()}` });
  const closed = await bugs.create(request, { title: `closed-filter-${Date.now()}` });
  await request.put(`/api/bugs/${closed.id}`, { data: { ...closed, state: "closed" } });
  await page.reload();
  await page.getByRole("button", { name: "Closed" }).click();
  await expect(page.getByText(closed.title, { exact: true })).toBeVisible();
  await expect(page.getByText(open.title, { exact: true })).toHaveCount(0);
});

test("sorting applies within the selected state @13-bug-status AC5", async ({ page, request }) => {
  const prefix = `state-sort-${Date.now()}`;
  const zulu = await bugs.create(request, { title: `${prefix}-zulu` });
  const alpha = await bugs.create(request, { title: `${prefix}-alpha` });
  await page.reload();
  await page.getByRole("button", { name: "Title" }).click();
  const rows = page.locator("tbody tr[role='button']").filter({ hasText: prefix });
  await expect(rows.first()).toContainText(alpha.title);
  await expect(rows.last()).toContainText(zulu.title);
});

test("search and state filters apply together @13-bug-status AC6", async ({ page, request }) => {
  const open = await bugs.create(request, { title: `combined-open-${Date.now()}` });
  const closed = await bugs.create(request, { title: `combined-closed-${Date.now()}` });
  await request.put(`/api/bugs/${closed.id}`, { data: { ...closed, state: "closed" } });
  await page.reload();
  await page.getByRole("button", { name: "Closed" }).click();
  await page.getByRole("search", { name: "Search bugs by title" }).fill("combined");
  await expect(page.getByText(closed.title, { exact: true })).toBeVisible();
  await expect(page.getByText(open.title, { exact: true })).toHaveCount(0);
});

test("empty selected state shows no-matches message @13-bug-status AC7", async ({ page, request }) => {
  await bugs.create(request, { title: `only-open-${Date.now()}` });
  await page.reload();
  await page.getByRole("button", { name: "Closed" }).click();
  await expect(page.getByText("No bugs matched.", { exact: true })).toBeVisible();
  await expect(page.locator("tbody tr[role='button']")).toHaveCount(0);
});
