import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("board shows the specified bug columns in order @07-bug-board AC1", async ({ page }) => {
  const headers = page.getByRole("columnheader");
  const labels = (await headers.allTextContents()).map((text) => text.replace(/[↑↓]/g, "").trim());
  expect(labels).toEqual(["ID", "Severity", "Title", "Owner"]);
});

test("board shows each bug's ID, severity, title, and owner @07-bug-board AC2", async ({ page, request }) => {
  const bug = await bugs.create(request, {
    title: `board-row-${Date.now()}`,
    severity: "high",
    owner: "board-owner",
  });
  await page.reload();
  const row = page.locator("tbody tr").filter({ hasText: bug.title });
  await expect(row).toContainText(`${bug.id}`);
  await expect(row).toContainText("HIGH");
  await expect(row).toContainText("board-owner");
});

test("board keeps its table when there are no bugs @07-bug-board AC3", async ({ page }) => {
  // Stub the API with an empty list: the shared DB may already hold bugs, so a real
  // empty board cannot be guaranteed otherwise.
  await page.route("**/api/bugs", (route) => route.fulfill({ json: [] }));
  await page.reload();
  await expect(page.getByRole("table", { name: "Bugs" })).toBeVisible();
  await expect(page.locator("tbody tr[role='button']")).toHaveCount(0);
});

test("board displays severity in uppercase @07-bug-board AC4", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `severity-case-${Date.now()}`, severity: "high" });
  await page.reload();
  const row = page.locator("tbody tr").filter({ hasText: bug.title });
  await expect(row).toContainText("HIGH");
});
