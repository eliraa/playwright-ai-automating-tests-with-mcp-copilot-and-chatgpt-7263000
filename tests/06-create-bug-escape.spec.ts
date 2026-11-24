import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("Escape closes the create-bug modal without saving @06-create-bug AC6", async ({ page }) => {
  const title = `closed-with-escape-${Date.now()}`;
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Description").fill("Not saved.");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});
