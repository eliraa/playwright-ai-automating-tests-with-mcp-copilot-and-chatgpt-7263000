import { readFileSync } from "node:fs";
import type { APIRequestContext, Page } from "@playwright/test";

interface UserCredential {
  username: string;
  password: string;
}

export const users = JSON.parse(
  readFileSync(new URL("../users.json", import.meta.url), "utf8"),
) as UserCredential[];

export const user = users[0];

if (!user) {
  throw new Error("users.json must contain at least one user.");
}

export async function login(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
}

export interface BugInput {
  title: string;
  severity?: "high" | "mid" | "low";
  owner?: string;
  description?: string;
  state?: "open" | "closed";
}

export interface CreatedBug {
  id: number;
  title: string;
  severity: string;
  owner: string;
  description: string;
  state: string;
}

export function createBugTracker() {
  const bugIds = new Set<number>();

  return {
    async create(request: APIRequestContext, input: BugInput): Promise<CreatedBug> {
      // Seed through the API instead of the UI: it is much faster and keeps unrelated tests
      // from failing when the create-bug form itself is broken.
      const response = await request.post("/api/bugs", {
        data: {
          title: input.title,
          severity: input.severity ?? "mid",
          owner: input.owner ?? user.username,
          description: input.description ?? "Created for a Playwright specification.",
          ...(input.state ? { state: input.state } : {}),
        },
      });
      if (!response.ok()) {
        throw new Error(`Could not create test bug: ${response.status()}`);
      }
      const bug = (await response.json()) as CreatedBug;
      bugIds.add(bug.id);
      return bug;
    },
    forget(id: number): void {
      bugIds.delete(id);
    },
    async cleanup(request: APIRequestContext): Promise<void> {
      // Delete only the bugs this test created (tracked by id) so parallel tests and the
      // shared DB are not affected; a failed delete throws so leaked data is noticed.
      for (const id of bugIds) {
        const response = await request.delete(`/api/bugs/${id}`);
        if (!response.ok()) {
          throw new Error(`Could not clean up test bug ${id}: ${response.status()}`);
        }
      }
      bugIds.clear();
    },
  };
}
