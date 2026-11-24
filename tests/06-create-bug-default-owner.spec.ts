import { expect, test } from "@playwright/test";
import { login, user } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("create-bug modal defaults owner to the current user @06-create-bug AC2", async ({ page }) => {
  await page.getByRole("button", { name: "New Bug" }).click();
  await expect(page.getByRole("dialog").getByLabel("Owner")).toHaveValue(user.username);
});
