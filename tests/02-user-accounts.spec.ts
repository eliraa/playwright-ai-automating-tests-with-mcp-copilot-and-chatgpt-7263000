import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

interface UserCredential {
  username: string;
  password: string;
}

const users = JSON.parse(
  readFileSync(new URL("../users.json", import.meta.url), "utf8"),
) as UserCredential[];

test("users.json includes the default user @02-user-accounts AC4", () => {
  expect(users).toContainEqual({ username: "buggy", password: "1970beetle" });
});

test("user accounts have unique usernames @02-user-accounts AC3", () => {
  const usernames = users.map((account) => account.username);
  expect(new Set(usernames).size).toBe(usernames.length);
});

test("each user account has a username and password @02-user-accounts AC2", () => {
  expect(users.length).toBeGreaterThan(0);
  for (const account of users) {
    expect(account.username).toEqual(expect.any(String));
    expect(account.password).toEqual(expect.any(String));
  }
});
