import { expect, test } from "@playwright/test";
import { login } from "./test-helpers";

test("seed", {tag: '@seed' }, async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/board$/);
});
