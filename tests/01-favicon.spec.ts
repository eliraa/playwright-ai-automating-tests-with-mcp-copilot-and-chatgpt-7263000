import { expect, test } from "@playwright/test";

test("the app references the project favicon @01-favicon AC1", async ({ page, request }) => {
  await page.goto("/login");

  const favicon = page.locator('link[rel="icon"]');
  await expect(favicon).toHaveAttribute("href", "/favicon.ico");
  const response = await request.get("/favicon.ico");
  expect(response.ok()).toBeTruthy();
});
