import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("blank required create-bug fields block saving @06-create-bug AC8", async ({ page }) => {
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Owner").fill("");
  await dialog.getByLabel("Description").fill("");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("alert")).toContainText("Owner is required.");
  await expect(dialog.getByRole("alert")).toContainText("Description is required.");
});
