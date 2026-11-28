# Test Review: Copilot-generated Playwright tests

Static review only. No test or app file was changed and no tests were run. Backend and frontend code was read only to check what the tests claim.

Spec files carry no AC IDs. The IDs below (`AC1`, `AC2`, …) are the scenarios in file order, which is the numbering the tests already use in their `@NN-feature ACn` tags. Scenario Outlines count as one AC.

---

## Summary

| Metric | Value |
| --- | --- |
| Spec files / ACs | 13 / 72 |
| Test files / test cases | 26 / about 68 (2 are the stock Playwright demo) |
| **Covered** | 35 (49%) |
| **Partially covered** | 33 (46%) |
| **Claimed but not verified** | 2 (05 AC4, 08 AC3) |
| **Not covered** | 2 (01 AC2, 06 AC9) |

**Overall:** Tag-to-AC mapping is accurate. There are no mis-tagged tests, and there are no hard-coded waits (`waitForTimeout`). Seeding goes through the API and cleans up after itself. Locators are mostly role/label based.

Weaknesses:
1. **False-pass negative checks.** Three Cancel/X/Escape tests pass while the board is still loading (F1).
2. **Shared database with `fullyParallel: true`.** At least one test depends on global state (F2). Others use `.last()` or substring matches that could pick up another test's data (F4, F10).
3. **Implementation-coupled assertions.** Several tests check CSS class names (`severity-badge-high`, `bg-primary`) instead of visible behavior (F5, F8).
4. **Thin save-path checks.** Only the title is verified after the core create and edit saves (F3, §6).
5. **Spec/app contradictions.** The spec says severity can be left blank, but the dropdown always has a value (§Spec issues).

Fix F1–F5 first. They change pass/fail outcomes. The rest is hygiene.

---

## Coverage matrix

Files are in `tests/`. "Claimed" means the test's tag names that AC.

### 01 Favicon
| AC | Test | Status |
| --- | --- | --- |
| AC1 Beetle favicon shown | `01-favicon.spec.ts` | Partially. Checks the `href` and an HTTP 200, not the image (F9). |
| AC2 Cartoon style | none | **Not covered** (visual and subjective; needs a screenshot or manual check) |

### 02 User accounts
| AC | Test | Status |
| --- | --- | --- |   
| AC1 `users.json` in project root | none tagged. Every test reads `../users.json` | Covered (implicit, untagged) |
| AC2 Username and password per account | `02-user-accounts.spec.ts:22` | Partially. `expect.any(String)` accepts `""` (F17) |
| AC3 Unique usernames | `:17` | Covered |
| AC4 Default user exists | `:13` | Covered. Credentials are hard-coded in the test (F17) |

### 03 Login
| AC | Test | Status |
| --- | --- | --- |
| AC1 Login page fields | `03-login.spec.ts:8` | Covered |
| AC2 Redirect when unauthenticated | `:14` | Covered (checks `/board` only, not "any page") |
| AC3 Valid login | `:19` | Covered |
| AC4 Enter submits (x2) | `:26` | Covered |
| AC5 Invalid username | `:35` | Partially. Doesn't assert "not authenticated" (F6) |
| AC6 Invalid password | `:42` | Partially (F6) |
| AC7 Blank username | `:49` | Partially (F6) |
| AC8 Blank password | `:55` | Partially (F6) |
| AC9 Blank both | `:61` | Partially (F6) |
| AC10 Trim username | `:66` | Covered |
| AC11 Auth user redirected from /login | `:73` | Covered (shares a test with AC12, F13) |
| AC12 Session persists on refresh | `:73` | Partially. URL only, no content check (F13) |

### 04 Title bar
| AC | Test | Status |
| --- | --- | --- |
| AC1 Title bar as designed | `04-title-bar.spec.ts:8` | Partially. Elements exist, but layout, rounded logo and theme aren't checked (F15) |

### 05 Logout
| AC | Test | Status |
| --- | --- | --- |
| AC1 Logout → login page | `05-logout.spec.ts:8` | Covered |
| AC2 Can't reach board after logout | `:13` | Covered |
| AC3 Back button doesn't restore session | `:19` | Partially. Negative URL check, and the second half repeats AC2 (F7) |
| AC4 Back-button landing redirected | `:27` | **Claimed but not verified.** It is identical to AC2 and never uses back (F7) |

### 06 Create bug
| AC | Test | Status |
| --- | --- | --- |
| AC1 Modal opens with fields | `06-create-bug-modal.spec.ts` | Covered |
| AC2 Owner defaults to current user | `06-create-bug-default-owner.spec.ts` | Covered |
| AC3 Save with required fields | `create-bug.spec.ts:25` | Partially. UI only, spec data replaced, leaves data behind (F3) |
| AC4 Cancel | `06-create-bug-cancel.spec.ts` | Partially. Can false-pass (F1) |
| AC5 X button | `06-create-bug-close.spec.ts` | Partially (F1) |
| AC6 Escape | `06-create-bug-escape.spec.ts` | Partially (F1) |
| AC7 Backdrop click | `06-create-bug-backdrop.spec.ts` | Covered. Uses magic coordinates (F16) |
| AC8 Save blocked when blank | `06-create-bug-required-fields.spec.ts` | Partially (F11) |
| AC9 Each required field (outline) | none | **Not covered** |

### 07 Bug board
| AC | Test | Status |
| --- | --- | --- |
| AC1 Columns and order | `07-bug-board.spec.ts:14` | Covered |
| AC2 One row per bug with fields | `:20` | Partially. Substring match on ID (F10) |
| AC3 Empty table | `:33` | Partially. Mocked API, can pass while loading (F12) |
| AC4 Severity uppercase | `:40` | Covered. Near-duplicate of AC2 (F18) |

### 08 Board severity
| AC | Test | Status |
| --- | --- | --- |
| AC1 Colour-coded | `08-board-severity.spec.ts:14` | Partially. Checks class names, not colours (F4) |
| AC2 HIGH uses token | same test | Partially (F4) |
| AC3 Distinct / HIGH prominent | same test | **Claimed but not verified.** Only class names and font-weight 600 on HIGH |
| AC4 Tokens exist and are used | same test | Partially. Tokens are present, but the test never checks the badge uses them |

### 09 Edit bug
| AC | Test | Status |
| --- | --- | --- |
| AC1 Open from row | `09-edit-bug.spec.ts:14` | Covered |
| AC2 ID read-only, others editable | `:29` | Covered |
| AC3 Severity dropdown colours | `:40` | Partially. Class name only (F5) |
| AC4 Backdrop | `:49` | Covered. Magic coordinates (F16) |
| AC5 Save | `:60` | Covered. Only the title is varied |
| AC6 Cancel / AC7 X / AC8 Escape | `:73` (loop) | Covered. Three ACs in one tagged test |
| AC9 Save disabled, no changes | `:91` | Covered |
| AC10 Save disabled, blank field | `:98` | Partially. Only Title is blanked, not owner or description |

### 10 Sort board columns
| AC | Test | Status |
| --- | --- | --- |
| AC1 Default Severity desc | `10-sort-board-columns.spec.ts:26` | Covered. Uses `aria-sort`, not the visible arrow |
| AC2 Click → ascending | `:36` | Partially. Only the first row is checked (F14) |
| AC3 Toggle | `:44` | Partially. Only the first row is checked (F14) |
| AC4 One active column | `:54` | Partially. No rows and no order check (F14) |
| AC5 Severity asc | `:61` | Covered |
| AC6 Severity desc | `:70` | Covered |
| AC7 All four sortable | `:81` | Covered. Only the indicator, not the row order |

### 11 Search
| AC | Test | Status |
| --- | --- | --- |
| AC1 Blank shows all | `11-search-blank.spec.ts` | Partially. Never types or clears, so it is just a page-load check |
| AC2 Filters by title | `11-search-title-filter.spec.ts` | Covered |
| AC3 Normalisation | `11-search-normalization.spec.ts` | Partially. Only one punctuation case; whitespace collapse and mixed case are not exercised |
| AC4 Clear X | `11-search-clear.spec.ts` | Covered |
| AC5 Sort preserved | `11-search-preserves-sort.spec.ts` | Covered |
| AC6 No results message | `11-search-no-results.spec.ts` | Covered |

### 12 Delete
| AC | Test | Status |
| --- | --- | --- |
| AC1 Delete button | `12-delete-bug.spec.ts:14` | Covered |
| AC2 Delete removes bug | `:21` | Covered. Checks the UI and a 404 from the API |

### 13 Bug status
| AC | Test | Status |
| --- | --- | --- |
| AC1 New bug is Open | `13-bug-status.spec.ts:14` | Partially. Never asserts the state, and leaves data behind (F3) |
| AC2 Edit state | `:26` | Partially. Race condition (F2b) |
| AC3 Default filter Open | `:38` | Partially. Tailwind class assertion (F8) |
| AC4 Closed filter | `:50` | Covered |
| AC5 Sort within state | `:60` | Partially. Seeds only open bugs, so the state filter isn't exercised (F19) |
| AC6 Search + state | `:71` | Partially. The state filter alone passes it (F19) |
| AC7 Empty state message | `:82` | Partially. Flaky on global state (F2) |

### Tests with no AC, duplicates and mis-tags
- **`example.spec.ts`**: the Playwright demo. It hits `playwright.dev` and has no AC. Delete it (F20).
- **`create-bug.spec.ts`**: covers 06 AC3 but is not named like its siblings. It duplicates the `users.json` loader and login from `test-helpers.ts` (F3).
- **`05-logout.spec.ts:27` (AC4)** duplicates `:13` (AC2).
- **`07-bug-board.spec.ts:40` (AC4)** duplicates most of `:20` (AC2).
- **`08-board-severity.spec.ts:14`** lists AC1–AC4 in one test, so a failure doesn't say which AC broke.
- **`03-login.spec.ts:73`** lists AC11 and AC12 in one test.
- **No wrong tags found.** Every tag points at the AC whose behavior the test attempts. In 05 AC4 and 08 AC3 the test doesn't prove the AC.

---

## Findings (sorted by severity)

### High

**F1. Negative check after `reload()` can pass while the board is still loading** (`06-create-bug-cancel.spec.ts:16-17`, `06-create-bug-close.spec.ts:16-17`, `06-create-bug-escape.spec.ts:16-17`)
```ts
await page.reload();
await expect(page.getByText(title, { exact: true })).toHaveCount(0);
```
After the reload the board shows "Loading…" (`BoardPage.tsx:243`). `toHaveCount(0)` is true immediately, with no row on screen. If Cancel, X or Escape wrongly saved the bug, these tests would still pass.
**Fix:** check the API instead, with a poll so a late save is also caught:
```ts
await expect.poll(async () =>
  (await (await request.get("/api/bugs")).json()).some((b) => b.title === title)
).toBe(false);
```
Alternatively, seed one known bug and wait for it to appear (a positive anchor) before asserting the absence.

**F2. 13 AC7 depends on global state** (`13-bug-status.spec.ts:82-88`)
The spec's precondition is "all bugs in the database are open". The test creates one open bug and clicks Closed. The suite runs with `fullyParallel: true` against one SQLite file. AC3, AC4 and AC6 of the same file create closed bugs at the same moment. Any closed bug left behind from a failed run breaks it too. Then "No bugs matched." never appears.
**Fix:** stub `GET /api/bugs` with `page.route` for this test (as 07 AC3 does), or run against a per-worker or reset database.

**F2b. Race: API read right after clicking Save** (`13-bug-status.spec.ts:33-35`)
```ts
await dialog.getByRole("button", { name: "Save" }).click();
const response = await request.get(`/api/bugs/${bug.id}`);
```
Nothing waits for the PUT. The modal closes only after the PUT returns (`EditBugModal.tsx:149-150`), so the GET can return the old state.
**Fix:** `await expect(dialog).toBeHidden();` before the GET, or wrap it in `expect.poll`. `09-edit-bug.spec.ts:68` already does this.

**F3. Core create-bug test is weak and leaves data behind** (`create-bug.spec.ts:25-41`)
- It checks only that the title appears. Severity, owner and description are never verified as saved, though the spec says "saved with the entered data".
- It uses its own title and description, not the spec's ("Login fails with special characters", with `<` and `>` in the description). The special-character case is the point of that scenario.
- `Date.now()` bugs are created through the UI and never deleted. `13-bug-status.spec.ts:14-24` does the same.
- It re-implements login and the `users.json` loader (`:4-23`) instead of using `test-helpers.ts`. The file name doesn't follow the `NN-feature-*` pattern.

**Fix:**
- Move it to `06-create-bug-save.spec.ts` and use the spec's data.
- After saving, `GET /api/bugs`, find the bug by title and assert all four fields.
- Delete it in `afterEach` (track the id via the API list).

**F4. Severity colour test would not fail if the colours were wrong** (`08-board-severity.spec.ts:14-32`)
- It asserts class names (`/severity-badge-high/`). If `.severity-badge-high` used the LOW colour, it would still pass.
- It checks that the CSS custom properties exist on `<html>`, but never that the badge uses them.
- `.last()` picks the last HIGH badge on the board. In a shared DB with parallel tests, that may belong to another test.
- One test lists four ACs.

**Fix:** scope to the seeded row and assert computed colours. Split it into one test per AC:
```ts
const badge = page.getByRole("row").filter({ hasText: high.title }).locator("[data-severity]");
await expect(badge).toHaveCSS("color", "rgb(184, 74, 46)");
```

### Medium

**F5. Edit severity colour is checked via a class name** (`09-edit-bug.spec.ts:46`). `toHaveClass(/severity-select-high/)` has the same flaw as F4, and only HIGH is exercised. **Fix:** parametrise over high/mid/low and assert computed `color`.

**F6. Failed-login tests never assert "not authenticated"** (`03-login.spec.ts:39,46,52,58,63`). They check the alert text only. If a bad login logged the user in and still showed an alert, they would pass. The alert copy is also hard-coded, though the spec doesn't define it. **Fix:** add `await expect(page).toHaveURL(/\/login$/)`. Either put the strings in a shared constant or relax them to `toBeVisible()`.

**F7. Logout back-button tests don't test the back button** (`05-logout.spec.ts:19-31`). AC4 is a line-for-line copy of AC2. AC3's `not.toHaveURL(/\/board$/)` passes as soon as the URL isn't `/board` (for example, a stale entry). Its second half repeats AC2. **Fix:** after logout, call `goBack()` and assert a positive state: `toHaveURL(/\/login$/)` and the login form is visible.

**F8. Tailwind class used as the "selected" signal** (`13-bug-status.spec.ts:45`). `toHaveClass(/bg-primary/)` breaks on any restyle. **Fix:** add `aria-pressed` (or `role="radio"` with `aria-checked`) to the Open/Closed toggle in the app and assert it. The same toggle needs a check that only one is selected.

**F9. Favicon check can't tell a missing file from the SPA fallback** (`01-favicon.spec.ts:8-9`). The Vite dev server answers unknown paths with `index.html` and a 200, so `response.ok()` is always true. **Fix:** also assert `content-type` starts with `image/` and the body is larger than 0 bytes (or compare it to `frontend/public/favicon.ico`).

**F10. Substring matches on shared data** (`07-bug-board.spec.ts:28-30`). `toContainText(`${bug.id}`)` matches ID 1 inside "11" or inside a timestamp title. **Fix:** assert the first cell exactly: `row.getByRole("cell").nth(0)` `toHaveText(String(bug.id))`. Do the same for severity and owner by cell.

**F11. Required-field test covers less than it claims** (`06-create-bug-required-fields.spec.ts:8-18`).
- It blanks Owner and Description. Title is blank only because the form starts empty, and no "Title is required." message is asserted.
- It never checks that nothing was saved.
- AC9 (each field separately) isn't covered at all.

**Fix:** parametrise over title, owner and description (valid values in the other fields). Assert the specific message, the dialog still open, and no new bug in the API list. Severity can't be blanked (see Spec issues).

**F12. Empty-board test mocks the API and can pass during loading** (`07-bug-board.spec.ts:33-38`). The table renders while "Loading…" is still shown, so `toHaveCount(0)` passes before the mocked response arrives. **Fix:** wait for the loading row to disappear (for example the "no bugs" row appears) before asserting zero rows.

**F13. AC11 and AC12 share one test, URL only** (`03-login.spec.ts:73-84`). It also re-reads `users[0]` instead of using the `user` already imported at `:2`. After the reload it should assert a board element (such as the "New Bug" button), not only the URL. Split into two tests.

**F14. Sort tests check too little** (`10-sort-board-columns.spec.ts`).
- AC2 and AC3 look at one row each (`.first()`).
- AC4 (`:54-59`) and AC7 (`:81-86`) seed no bugs, so they pass on an empty board and don't check "bugs sorted by severity only".

**Fix:** compare the full ordered list for the seeded prefix, for example `expect(rows.allTextContents()).toEqual([...])`.

**F15. Title bar test checks presence only** (`04-title-bar.spec.ts:8-12`). The AC says "as detailed in the Design section": left-justified logo in a rounded box, title right of the logo, right-justified logout. **Fix:** compare `boundingBox()` x positions (logo.x < heading.x < logout.x), or take a screenshot.

**F16. Magic coordinates and implicit overlay assumption** (`06-create-bug-backdrop.spec.ts:12`, `09-edit-bug.spec.ts:55`). `page.mouse.click(8, 8)` depends on the viewport and on the overlay covering that point. The dialog element is the full-screen overlay (`fixed inset-0`), so `dialog.click({ position: { x: 5, y: 5 } })` expresses the intent. (Severity Low–Medium.)

**F17. `02-user-accounts.spec.ts` (Low–Medium).** It uses its own loader instead of `test-helpers.ts`, and the default credentials are written into the test (`:14`) instead of being read from `users.json`. `expect.any(String)` accepts empty strings. **Fix:** import `users` from `test-helpers.ts`, assert `typeof === "string" && length > 0`, and avoid repeating credentials in source.

**F10b. Shared state: 20+ tests rely on unique `Date.now()` names.** Many files have the same pattern: `fullyParallel: true`, one SQLite file, cleanup through unauthenticated API calls. `bugs.cleanup` throws on a non-OK response, which can replace the real failure with a cleanup error. `12-delete-bug.spec.ts:26` calls `bugs.forget` before the assertions, so a failed delete leaves the bug behind. **Fix:** a worker-scoped fixture with unique prefixes, a per-worker database or a reset endpoint, and a cleanup that tolerates 404.

**F19. State-filter tests don't prove the filter is involved** (`13-bug-status.spec.ts:60-80`). AC5 seeds only open bugs. AC6 asserts the closed bug is shown and the open bug is hidden, but the Closed filter alone gives that result. **Fix:** AC5: add a closed bug and assert it is absent. AC6: add a closed bug whose title doesn't match the search and assert it's hidden.

### Low

**F18.** `07 AC4` duplicates the "HIGH" assertion in AC2 (`07-bug-board.spec.ts:40-45` vs `:29`). Merge it, or make AC4 seed a lowercase value through the API and assert the uppercase display.

**F20.** `example.spec.ts` hits `https://playwright.dev/`. It has no AC, needs network access and tests nothing in this app. Delete it.

**F21. Non-exact locators match more than intended.** `getByRole("button", { name: "Title" })` (`10-sort-board-columns.spec.ts:39,47,64,73`, `11-search-preserves-sort.spec.ts:21`, `13-bug-status.spec.ts:65`) is a substring match. Table rows are `role="button"`, so a bug title containing "Title" would collide. The same applies to `getByRole("button", { name: "Closed" })` (`13-bug-status.spec.ts:55,76,85`) and to `getByLabel("ID")` (`09-edit-bug.spec.ts:20,34`). **Fix:** add `{ exact: true }`, as 10 AC4 and AC7 already do.

**F22. `role="search"` is on the `<input>`** (`TitleBar.tsx:42`). `search` is a landmark role, so a text field should be `type="search"` (role `searchbox`). The tests (`getByRole("search", { name: "Search bugs by title" })`) work now but are coupled to the misuse. **Fix:** change the app, then use `getByRole("searchbox")`.

**F23. `fill()` doesn't simulate typing.** The spec says filtering happens as the user types. `fill()` sets the value in one step. **Fix:** use `pressSequentially` in at least one search test.

**F24. Login is repeated through the UI in 20 files** (`beforeEach(login)`). It works, but costs a page load per test and hides login failures, because `login()` (`test-helpers.ts:19-24`) never asserts success. **Fix:** a setup project that saves `storageState` (the session is kept in `localStorage`), or a fixture. Keep UI login only in `03-login.spec.ts`. Add `await expect(page).toHaveURL(/\/board$/)` at the end of `login()`.

**F25. Tags aren't greppable.** `AC7` in the title isn't a Playwright tag (`@06-create-bug` is). **Fix:** use `{ tag: "@06-create-bug", annotation: { type: "AC", description: "AC7" } }`, so reports can group by AC. Better still, add IDs to the spec files.

### Spec issues (ambiguous or contradicting app/tests)

1. **Severity can't be blank.** The spec (06 AC9 and Workflow Design) says severity must be filled in, but the dropdown defaults to `mid` and has no empty option (`CreateBugModal.tsx:25`). That outline row can't be tested. Decide: add an empty placeholder option, or drop `severity` from the outline.
2. **06 Out of Scope says "Displaying created bugs on the board".** 06 AC3's test (and 13 AC1) rely on exactly that. The spec is outdated by 07.
3. **No AC for create-modal severity colours**, though the Workflow Design requires them.
4. **No scenario IDs** in any spec. Tests number by position, so reordering a spec silently re-tags.
5. **Error copy** for login failures isn't specified, yet tests hard-code it.
6. **State casing** is undefined. The spec says "Open/Closed", the API returns `OPEN`/`CLOSED` while accepting lowercase, and the edit dropdown uses `open`/`closed` (`13-bug-status.spec.ts:31,35`). The test is coupled to each representation.
7. **10:** "Each column *may* be sortable", but the AC says all four *are*. The arrow indicator is the spec; the tests assert `aria-sort`, which is invisible.
8. **05 AC3 and AC4** describe near-identical situations.
9. **13 changes the meaning of "there are bugs"** in 07, 10 and 11 to "open bugs", because the default state filter is Open. The specs don't say so.
10. **Observation outside the test scope:** the `/api/bugs` routes have no authentication, which is why tests can seed data with an unauthenticated `request`. If auth is meant to protect the data, that's an app gap, and the seeding trick would stop working.

---

## 6. "Would this fail if the behavior broke?"

| # | Test | Would fail if… | Would **not** fail if… | Verdict |
| --- | --- | --- | --- | --- |
| 1 | **Valid login** (`03-login.spec.ts:19`) | the login API rejects valid users, or there's no redirect to `/board` | the session isn't persisted (checked elsewhere, by AC12) | Good |
| 2 | **Create bug** (`create-bug.spec.ts:25`) | Save does nothing, or the modal doesn't close, or the title isn't persisted | severity, owner or description are dropped or mis-saved; `<`/`>` get mangled | **Weak.** See F3 |
| 3 | **Edit save** (`09-edit-bug.spec.ts:60`) | the PUT fails or the title isn't stored | severity, owner, description or state edits are ignored by the backend | Partial. Vary and assert every field |
| 4 | **Delete** (`12-delete-bug.spec.ts:21`) | the row stays, the modal stays, or the API doesn't return 404 | – | Good |
| 5 | **Cancel doesn't save** (`06-create-bug-cancel.spec.ts`) | – | Cancel actually saves the bug (the board is still loading when the check runs) | **Would not fail.** See F1 |

Also flagged for the same question: the severity colour test (F4) would not fail if the HIGH and LOW colours were swapped in CSS. The 05 AC4 test would not fail if the back button restored the session, because it never presses back.

---

## Missing tests to add

1. **06 AC9:** parametrised "each required field blank" test (title, owner, description). Assert the message, the dialog stays open and nothing is saved. Severity: see Spec issue 1.
2. **06 AC3:** the spec's data (including `<` and `>`). Verify all fields through the API, then clean up.
3. **06:** the create modal's severity select uses the severity colours (design requirement, no AC yet).
4. **13 AC1:** `GET /api/bugs/:id` returns `state: "OPEN"` after UI creation.
5. **13:** the toggle has exactly one selected option (`aria-pressed`).
6. **05 AC4:** a real `goBack()` flow ending on a visible login form.
7. **03:** not-authenticated assertions on the five failure paths. Board content after refresh.
8. **08:** computed colours for HIGH, MID and LOW (parametrised). A distinctness check (three different colours) for AC3.
9. **09 AC10:** blank owner and blank description (parametrised). **AC3:** MID and LOW colours.
10. **10:** row order for ID and Owner, and order checks on every seeded row.
11. **11 AC3:** whitespace collapse (`"log   in"`, leading/trailing spaces), mixed case and other punctuation. The X control is hidden when the field is empty.
12. **04:** layout (logo left of the title, logout at the right edge).
13. **01:** favicon content type and size.
14. **03 AC2:** "any other page", for example `/board/1` or an unknown path, redirects to `/login`.

---

## Quick wins

1. Fix F1 (use `expect.poll` on `GET /api/bugs`). Three tests, a few lines each.
2. Add `await expect(dialog).toBeHidden()` before the API read in `13-bug-status.spec.ts:34` (F2b).
3. Stub the API in 13 AC7 (F2).
4. Delete `example.spec.ts`. Rename `create-bug.spec.ts` to `06-create-bug-save.spec.ts`, import from `test-helpers.ts` and clean up created bugs.
5. Add `{ exact: true }` to the non-exact `getByRole`/`getByLabel` calls (F21).
6. Add `toHaveURL(/\/login$/)` to the five failed-login tests (F6).
7. In `login()` (`test-helpers.ts`), assert the board URL at the end.
8. Replace `mouse.click(8, 8)` with a click on the dialog element at a position (F16).
9. Replace class-name assertions with computed-CSS or `aria-pressed` assertions (F4, F5, F8). The app change for `aria-pressed` is one attribute per button.
10. Add AC IDs to the specs and use Playwright `tag`/`annotation` (F25).
