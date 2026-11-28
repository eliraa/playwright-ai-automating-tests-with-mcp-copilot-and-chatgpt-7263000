import { expect, test } from "@playwright/test";
import { user, users } from "../tests/test-helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test("login page shows username, masked password, and login button @03-login AC1", async ({ page }) => {
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("unauthenticated board access redirects to login @03-login AC2", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login$/);
});

test("valid credentials open the board @03-login AC3", async ({ page }) => {
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/board$/);
});

for (const field of ["Username", "Password"]) {
  test(`Enter submits login from ${field.toLowerCase()} @03-login AC4`, async ({ page }) => {
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Password").fill(user.password);
    await page.getByLabel(field).press("Enter");
    await expect(page).toHaveURL(/\/board$/);
  });
}

test("invalid username shows generic login error @03-login AC5", async ({ page }) => {
  await page.getByLabel("Username").fill(`invalid-${Date.now()}`);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid username or password.");
});

test("invalid password shows generic login error @03-login AC6", async ({ page }) => {
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(`invalid-${Date.now()}`);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid username or password.");
});

test("blank username shows its validation error @03-login AC7", async ({ page }) => {
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Username cannot be blank.");
});

test("blank password shows its validation error @03-login AC8", async ({ page }) => {
  await page.getByLabel("Username").fill(user.username);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Password cannot be blank.");
});

test("blank credentials show their validation error @03-login AC9", async ({ page }) => {
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Please enter your username and password.");
});

test("login trims username whitespace @03-login AC10", async ({ page }) => {
  await page.getByLabel("Username").fill(`  ${user.username}  `);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/board$/);
});

test("authenticated login-page visits redirect to board and survive refresh @03-login AC11 AC12", async ({ page }) => {
  const account = users[0];
  if (!account) throw new Error("users.json must contain a user.");
  await page.getByLabel("Username").fill(account.username);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/board$/);
  await page.reload();
  await expect(page).toHaveURL(/\/board$/);
});
