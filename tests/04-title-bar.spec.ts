import { expect, test } from "@playwright/test";
import { login } from "./support";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("board shows the BuggyBoard title bar @04-title-bar AC1", async ({ page }) => {
  await expect(page.getByRole("banner").getByRole("img", { name: "BuggyBoard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "BuggyBoard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});
