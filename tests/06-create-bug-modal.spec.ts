import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("New Bug opens a modal with the required fields @06-create-bug AC1", async ({ page }) => {
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Title")).toBeVisible();
  await expect(dialog.getByLabel("Severity")).toBeVisible();
  await expect(dialog.getByLabel("Owner")).toBeVisible();
  await expect(dialog.getByLabel("Description")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
});
