import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("board severity badges use distinct severity classes and design tokens @08-board-severity AC1 AC2 AC3 AC4", async ({ page, request }) => {
  const high = await bugs.create(request, { title: `color-high-${Date.now()}`, severity: "high" });
  const mid = await bugs.create(request, { title: `color-mid-${Date.now()}`, severity: "mid" });
  const low = await bugs.create(request, { title: `color-low-${Date.now()}`, severity: "low" });
  await page.reload();

  const highBadge = page.locator('[data-severity="HIGH"]').filter({ hasText: "HIGH" }).last();
  const midBadge = page.locator('[data-severity="MID"]').filter({ hasText: "MID" }).last();
  const lowBadge = page.locator('[data-severity="LOW"]').filter({ hasText: "LOW" }).last();
  await expect(page.getByText(high.title, { exact: true })).toBeVisible();
  await expect(page.getByText(mid.title, { exact: true })).toBeVisible();
  await expect(page.getByText(low.title, { exact: true })).toBeVisible();
  await expect(highBadge).toHaveClass(/severity-badge-high/);
  await expect(midBadge).toHaveClass(/severity-badge-mid/);
  await expect(lowBadge).toHaveClass(/severity-badge-low/);
  await expect(highBadge).toHaveCSS("font-weight", "600");
  await expect(page.locator("html")).toHaveCSS("--color-severity-high", "#b84a2e");
  await expect(page.locator("html")).toHaveCSS("--color-severity-mid", "#a67c47");
  await expect(page.locator("html")).toHaveCSS("--color-severity-low", "#4a6b5e");
});
