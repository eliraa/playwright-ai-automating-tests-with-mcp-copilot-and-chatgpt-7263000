import { expect, test } from "@playwright/test";
import { login } from "../tests/test-helpers";

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("Cancel closes the create-bug modal without saving @06-create-bug AC4", async ({ page, request }) => {
  const title = `cancelled-${Date.now()}`;
  await page.getByRole("button", { name: "New Bug" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Description").fill("Not saved.");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();

  // Ask the API instead of reloading the page: after reload the board still shows
  // "Loading…", so a "bug title count is 0" check passes even if the bug WAS saved.
  // expect.poll keeps retrying until the server answers, so a late save is also caught.
  await expect.poll(async () => {
    const bugs = await (await request.get("/api/bugs")).json();
    return bugs.some((b: { title: string }) => b.title === title);
  }).toBe(false);
});
