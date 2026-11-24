# BuggyBoard: Use Specs as Context

When working on the **BuggyBoard** web app (bug tracker SUT for the Playwright course):

1. **Read the constitution** (`specs/constitution.md`) and the specs under `specs/` before implementing. Use at least:
   - `specs/product/vision.md` – what we're building
   - `specs/design/theme.md` – color theme and UI/UX design rules
   - `specs/engineering/tech-stack.md` – stack and constraints
   - `specs/engineering/coding-standards.md` – style and architecture
   - `specs/engineering/development-process.md` – spec-first, feature-by-feature, pause for review
2. **For a feature**, use the corresponding spec in `specs/features/` (e.g. `specs/features/01-login.md`).
3. **Update** `specs/PROGRESS.md` when a feature or step is completed.
4. **Pause for review** after each feature; do not start the next feature until the user directs.
5. **Ask the user** when a decision is unclear instead of assuming.


# Pre-push privacy and secrets check

When the user asks whether it is safe to push (or similar, e.g. "is it safe to push?"):

1. Run a **read-only** check. Do NOT modify any file.
2. Scope: everything staged or untracked-and-not-ignored (`git status`, `git diff --cached --name-only`), plus `docs/copilot-chats/*`, `docs/test-review.md`, `tests/`, `playwright.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json` and `.gitignore`.
3. Look for: API keys, tokens, passwords, bearer/auth headers, private keys, connection strings (`ghp_`, `github_pat_`, `sk-`, `AKIA`, `xox`, `eyJ`, `password=`, `token=`); `.env` files or values copied from environment variables or Codespaces secrets; personal data (real emails, phone numbers, home addresses, full real names beyond a public GitHub handle, local absolute paths containing a username); URLs with tokens or session IDs (Codespaces forwarded-port URLs are fine to mention but are not secrets); credentials for real services. The course's demo test users (e.g. in `users.json`) are expected and fine.
4. Report a table: file | line | what was found | risk (High/Medium/Low) | suggested fix. NEVER print a full secret or personal value: show only the first 3 characters, then `***`. If nothing is found, say "No sensitive data found" and list the files checked.
5. Always end with a clear verdict: **SAFE TO PUSH** or **DO NOT PUSH**, with the reasons.
