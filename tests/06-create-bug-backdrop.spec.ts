import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("clicking the create-bug backdrop preserves the open modal @06-create-bug AC7", async ({ page }) => {
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(`backdrop-${Date.now()}`);
  await page.mouse.click(8, 8);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Title")).toHaveValue(/backdrop-/);
});
