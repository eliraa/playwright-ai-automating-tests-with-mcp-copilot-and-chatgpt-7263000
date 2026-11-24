import { expect, test } from "@playwright/test";
import { createBugTracker, login } from "./support";

const bugs = createBugTracker();

test.beforeEach(async ({ page }) => {
  await login(page);
});

test.afterEach(async ({ request }) => {
  await bugs.cleanup(request);
});

test("clicking a row opens the bug details @09-edit-bug AC1", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `open-edit-${Date.now()}`, severity: "high" });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: `Edit bug #${bug.id}` })).toBeVisible();
  await expect(dialog.getByLabel("ID")).toHaveValue(`${bug.id}`);
  await expect(dialog.getByLabel("Title")).toHaveValue(bug.title);
  await expect(dialog.getByLabel("Severity")).toHaveValue("high");
  await expect(dialog.getByLabel("Owner")).toHaveValue(bug.owner);
  await expect(dialog.getByLabel("Description")).toHaveValue(bug.description);
  await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
});

test("edit modal makes ID read-only and other fields editable @09-edit-bug AC2", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `editable-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("ID")).toHaveAttribute("readonly", "");
  for (const label of ["Title", "Severity", "Owner", "Description"]) {
    await expect(dialog.getByLabel(label)).toBeEnabled();
  }
});

test("edit severity dropdown uses severity colors @09-edit-bug AC3", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `severity-edit-${Date.now()}`, severity: "high" });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const severity = page.getByRole("dialog").getByLabel("Severity");
  await expect(severity.locator("option")).toHaveText(["HIGH", "MID", "LOW"]);
  await expect(severity).toHaveClass(/severity-select-high/);
});

test("clicking edit backdrop preserves changes @09-edit-bug AC4", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `edit-backdrop-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("Unsaved title");
  // Click by coordinates in the corner: the backdrop has no role or label to target,
  // and clicking the dialog's own locator would never hit the backdrop.
  await page.mouse.click(8, 8);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Title")).toHaveValue("Unsaved title");
});

test("saving edit changes persists the new value @09-edit-bug AC5", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `edit-save-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  const updatedTitle = `${bug.title}-updated`;
  await dialog.getByLabel("Title").fill(updatedTitle);
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();
  // Assert on the API response, not the UI: the board could show the new title from client
  // state even if the save never reached the server.
  const response = await request.get(`/api/bugs/${bug.id}`);
  expect((await response.json()).title).toBe(updatedTitle);
});

for (const closeAction of ["Cancel", "Close", "Escape"] as const) {
  test(`${closeAction} discards edit changes @09-edit-bug AC6 AC7 AC8`, async ({ page, request }) => {
    const bug = await bugs.create(request, { title: `edit-cancel-${closeAction}-${Date.now()}` });
    await page.reload();
    await page.getByText(bug.title, { exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title").fill(`${bug.title}-unsaved`);
    if (closeAction === "Escape") {
      await page.keyboard.press("Escape");
    } else {
      await dialog.getByRole("button", { name: closeAction }).click();
    }
    await expect(dialog).toBeHidden();
    const response = await request.get(`/api/bugs/${bug.id}`);
    expect((await response.json()).title).toBe(bug.title);
  });
}

test("edit Save is disabled when there are no changes @09-edit-bug AC9", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `no-changes-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Save" })).toBeDisabled();
});

test("edit Save is disabled when a required value is blank @09-edit-bug AC10", async ({ page, request }) => {
  const bug = await bugs.create(request, { title: `blank-edit-${Date.now()}` });
  await page.reload();
  await page.getByText(bug.title, { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill("");
  await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();
});
