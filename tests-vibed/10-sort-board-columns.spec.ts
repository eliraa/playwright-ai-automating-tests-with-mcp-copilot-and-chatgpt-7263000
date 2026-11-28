import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "../tests/test-helpers";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

async function seedSortBugs(request: Parameters<typeof bugs.create>[0]) {
  const prefix = `sort-${Date.now()}`;
  const low = await bugs.create(request, { title: `${prefix}-alpha`, severity: "low", owner: "Alpha" });
  const mid = await bugs.create(request, { title: `${prefix}-mango`, severity: "mid", owner: "Mango" });
  const high = await bugs.create(request, { title: `${prefix}-zulu`, severity: "high", owner: "Zulu" });
  return { prefix, low, mid, high };
}

function sortedRows(page: import("@playwright/test").Page, prefix: string) {
  // Filter by this test's unique prefix so other bugs on the shared board cannot change
  // the row positions that nth()/first() rely on.
  return page.locator("tbody tr[role='button']").filter({ hasText: prefix });
}

test("board defaults to Severity descending @10-sort-board-columns AC1", async ({ page, request }) => {
  const seeded = await seedSortBugs(request);
  await page.reload();
  await expect(page.getByRole("columnheader", { name: /Severity/ })).toHaveAttribute("aria-sort", "descending");
  await expect(sortedRows(page, seeded.prefix).nth(0)).toContainText(seeded.high.title);
  await expect(sortedRows(page, seeded.prefix).nth(1)).toContainText(seeded.mid.title);
  await expect(sortedRows(page, seeded.prefix).nth(2)).toContainText(seeded.low.title);
  await expect(page.getByRole("columnheader", { name: /Title/ })).not.toHaveAttribute("aria-sort", /.+/);
});

test("clicking a column sorts it ascending @10-sort-board-columns AC2", async ({ page, request }) => {
  const seeded = await seedSortBugs(request);
  await page.reload();
  await page.getByRole("button", { name: "Title" }).click();
  await expect(page.getByRole("columnheader", { name: /Title/ })).toHaveAttribute("aria-sort", "ascending");
  await expect(sortedRows(page, seeded.prefix).first()).toContainText(seeded.low.title);
});

test("clicking the active column toggles sort direction @10-sort-board-columns AC3", async ({ page, request }) => {
  const seeded = await seedSortBugs(request);
  await page.reload();
  const titleHeader = page.getByRole("button", { name: "Title" });
  await titleHeader.click();
  await titleHeader.click();
  await expect(page.getByRole("columnheader", { name: /Title/ })).toHaveAttribute("aria-sort", "descending");
  await expect(sortedRows(page, seeded.prefix).first()).toContainText(seeded.high.title);
});

test("only one column has an active sort indicator @10-sort-board-columns AC4", async ({ page }) => {
  // Names match as case-insensitive substrings by default, so short labels like 'ID' could
  // hit other buttons; exact: true pins each click to the intended column header.
  await page.getByRole("button", { name: "Owner", exact: true }).click();
  await page.getByRole("button", { name: "Severity", exact: true }).click();
  await expect(page.getByRole("columnheader", { name: /Severity/ })).toHaveAttribute("aria-sort", "ascending");
  await expect(page.getByRole("columnheader", { name: /Owner/ })).not.toHaveAttribute("aria-sort", /.+/);
});

test("severity ascending order is LOW, MID, HIGH @10-sort-board-columns AC5", async ({ page, request }) => {
  const seeded = await seedSortBugs(request);
  await page.reload();
  await page.getByRole("button", { name: "Severity" }).click();
  await expect(sortedRows(page, seeded.prefix).nth(0)).toContainText(seeded.low.title);
  await expect(sortedRows(page, seeded.prefix).nth(1)).toContainText(seeded.mid.title);
  await expect(sortedRows(page, seeded.prefix).nth(2)).toContainText(seeded.high.title);
});

test("severity descending order is HIGH, MID, LOW @10-sort-board-columns AC6", async ({ page, request }) => {
  const seeded = await seedSortBugs(request);
  await page.reload();
  const severityHeader = page.getByRole("button", { name: "Severity" });
  await severityHeader.click();
  await severityHeader.click();
  await expect(sortedRows(page, seeded.prefix).nth(0)).toContainText(seeded.high.title);
  await expect(sortedRows(page, seeded.prefix).nth(1)).toContainText(seeded.mid.title);
  await expect(sortedRows(page, seeded.prefix).nth(2)).toContainText(seeded.low.title);
});

test("all four board columns are sortable @10-sort-board-columns AC7", async ({ page }) => {
  for (const label of ["ID", "Severity", "Title", "Owner"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.getByRole("columnheader", { name: new RegExp(label) })).toHaveAttribute("aria-sort", /ascending|descending/);
  }
});
