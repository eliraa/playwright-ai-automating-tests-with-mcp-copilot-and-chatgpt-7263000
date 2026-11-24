import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

interface UserCredential {
  username: string;
  password: string;
}

const users = JSON.parse(
  readFileSync(new URL("../users.json", import.meta.url), "utf8"),
) as UserCredential[];
const user = users[0];

if (!user) {
  throw new Error("users.json must contain at least one user.");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
});

test("user can create a bug @06-create-bug AC3", async ({ page }) => {
  const bugTitle = `Playwright-created bug ${Date.now()}`;

  await page.getByRole("button", { name: "New Bug" }).click();

  const createBugDialog = page.getByRole("dialog");
  await expect(createBugDialog).toBeVisible();
  await createBugDialog.getByLabel("Title").fill(bugTitle);
  await createBugDialog.getByLabel("Severity").selectOption("high");
  await createBugDialog.getByLabel("Owner").fill(user.username);
  await createBugDialog
    .getByLabel("Description")
    .fill("Created by the Playwright end-to-end test.");
  await createBugDialog.getByRole("button", { name: "Save" }).click();

  await expect(createBugDialog).toBeHidden();
  await expect(page.getByText(bugTitle, { exact: true })).toBeVisible();
});
