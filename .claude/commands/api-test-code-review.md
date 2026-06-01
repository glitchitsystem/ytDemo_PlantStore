---
description: Review an API test file for quality issues — missing edge cases, leaked state, weak assertions, bad naming, and more. Returns a prioritized list of findings with line numbers and suggested fixes.
argument-hint: "Path to the test file to review — e.g. tests/api/auth.spec.ts"
---

You are a senior QA engineer and TypeScript expert doing a thorough code review of an API test file in the Plant Store project. Review the file at: $ARGUMENTS

## Step 1 — Read everything you need

1. Read the test file at `$ARGUMENTS`
2. Read the server route handler(s) that the tests cover — find them in `server/server.js` and `server/routes/`
3. Read `tests/cart-checkout.spec.ts` as a baseline for the project's expected test quality and conventions

Understanding the server code is essential — you cannot identify missing edge cases without knowing what the server actually does.

## Step 2 — Audit the file against every category below

Work through each category systematically. For every issue found, note the exact line number, describe the problem concisely, explain why it matters, and provide a concrete fix.

---

### Category 1 — Coverage gaps

Compare the test scenarios against the actual server logic:

- **Missing happy path variants** — Does the server support optional fields, different input combinations, or multiple success outcomes? Are all of them tested?
- **Missing validation cases** — For each required field in the request body, is there a test that omits it and expects 400? For each field with a format constraint (email, password length, positive number), is there a test with an invalid value?
- **Missing auth scenarios** — If the endpoint requires a JWT: is there a test for no token? Malformed token? Valid token for the wrong user (if applicable)?
- **Missing business logic edge cases** — Does the server check stock levels? Duplicate records? Empty arrays? Boundary values? Are those tested?
- **Missing error propagation** — If the server can return 404 (record not found), 409 (conflict), 422, or 500, are those covered?

---

### Category 2 — Test isolation and state leakage

- **Shared mutable state** — Do tests share variables that could carry state between runs? Every test must be fully independent.
- **Missing cleanup** — If a test creates a resource (user, order), is there a corresponding delete or does it pollute subsequent runs?
- **Order dependency** — Does a later test rely on a record created by an earlier test? If yes, each test must create its own data.
- **Global beforeAll side effects** — If a `beforeAll` creates auth tokens or seeds data, is it scoped to the correct `describe` block so it doesn't leak?

---

### Category 3 — Assertion quality

- **Status code only** — Does any test assert only the HTTP status code without validating the response body? Both must be checked.
- **Body shape only** — Does any test assert response fields exist without checking their values or types?
- **Overly broad matchers** — `expect(body).toBeTruthy()` or `expect(response.ok()).toBeTruthy()` tells you almost nothing. Flag any assertion that wouldn't catch a regression in the response contract.
- **Missing negative assertions** — After a failed request, does the test confirm the resource was NOT created? (e.g. after a 400 on register, confirm the user count didn't increase)
- **Brittle string matching** — `toContain('error')` on an error message is fragile. If the server returns a structured `{ error: string }` field, assert the field exists and has meaningful content.
- **Float comparisons** — Price fields must use `toBeCloseTo(n, 2)` not `toBe(n)`.

---

### Category 4 — Data factory and DRY

- **Inline request bodies** — Every `request.post()` call should pass an object from a factory function, not a hardcoded object literal. Flag any test that constructs its payload inline.
- **Duplicated setup** — If 3+ tests do the same setup steps (register user, get token, etc.), that logic should be in a `beforeAll` or helper function.
- **Magic strings** — Hardcoded values like `'Password123!'`, `'test@example.com'`, or `'Snake Plant'` repeated across multiple tests should be constants or factory defaults.
- **Missing override pattern** — Factory functions should accept `Partial<T>` so individual tests can vary one field at a time. Flag factories that don't.

---

### Category 5 — Naming and readability

- **Vague test names** — Names like `"test 1"`, `"should work"`, `"error case"` are not acceptable. Each test name must be a full sentence stating the expected outcome: `"returns 400 when email field is missing"`.
- **Wrong describe nesting** — Tests should be grouped by scenario category (happy path, validation errors, auth errors, edge cases) using nested `describe` blocks. Flat test lists in a single describe are a smell.
- **Misleading names** — A test named `"returns 200"` that actually asserts a 201 is a lie. Flag any mismatch.
- **Unused imports or variables** — Flag dead code.

---

### Category 6 — Technical correctness

- **Wrong HTTP client** — Playwright API tests must use the `request` fixture from `@playwright/test`, not `axios`, `fetch`, or `node:http`. Flag any other HTTP client.
- **Hardcoded localhost URLs** — Base URLs should use the `baseURL` from `playwright.config.ts` or a named constant, not inline `'http://localhost:5001'` strings scattered through tests.
- **`any` types** — TypeScript's `any` defeats the purpose of typing. Flag every use.
- **Untyped response parsing** — `const body = await response.json()` without a type assertion should be flagged; use `as ResponseType` or define an interface.
- **Missing `await`** — Async calls without `await` are silent bugs. Check every `request.get/post/put/delete` call.
- **`waitForTimeout` usage** — Banned. Flag it and suggest the correct wait strategy.

---

## Step 3 — Format your findings

Output a structured report in this exact format:

```
## API Test Review: [filename]

### Summary
X issues found across Y categories. [One sentence overall quality assessment.]

---

### [CRITICAL / HIGH / MEDIUM / LOW] — [Category Name]
**Line [N]:** [What the issue is]
**Why it matters:** [The risk or failure mode this creates]
**Fix:**
\`\`\`typescript
// suggested replacement code
\`\`\`

---
[repeat for each finding]

---

### What's working well
- [List 2-4 things done correctly — coverage areas, patterns, assertions that are solid]
```

Severity definitions:
- **CRITICAL** — Test passes when it should fail, or silently misses a real bug class
- **HIGH** — Significant coverage gap or assertion weakness that would let regressions through
- **MEDIUM** — State leakage, DRY violation, or naming issue that degrades maintainability
- **LOW** — Style, readability, or minor improvement

Order findings by severity descending. If no issues are found in a category, omit that category from the output.
