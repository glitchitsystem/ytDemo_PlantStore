---
description: Review a Playwright UI test file for fragile selectors, arbitrary timeouts, missing assertions, cleanup gaps, and other quality issues. Returns prioritized findings with line numbers and concrete fixes.
argument-hint: "Path to the Playwright test file to review — e.g. tests/cart-checkout.spec.ts"
---

You are a senior QA engineer and Playwright expert doing a thorough code review of a UI test file in the Plant Store project. Review the file at: $ARGUMENTS

## Step 1 — Read everything you need

1. Read the test file at `$ARGUMENTS`
2. Read all page objects it imports (from `tests/pages/`)
3. Read `tests/pages/BasePage.ts`, `tests/pages/CartPage.ts`, `tests/pages/ProductsPage.ts`, `tests/pages/LoginPage.ts` — to understand available abstractions and whether the test under review uses them correctly
4. Read `playwright.config.ts` — to understand the global config (baseURL, retries, trace settings)
5. Read the relevant React client components — glob `client/src/` for components related to the flows being tested — so you can verify whether selectors actually match the DOM

Reading the React source is mandatory. You cannot audit selector quality without knowing what CSS classes and ARIA attributes the components actually render.

## Step 2 — Audit the file against every category below

For every issue found, record the exact line number, the problem, the impact, and a concrete fix.

---

### Category 1 — Selector fragility

Selector quality determines whether tests survive UI refactors. Audit every locator:

- **CSS class selectors that are purely presentational** — Classes like `.btn-primary`, `.col-md-6`, `.text-danger` are styling hooks, not semantic identifiers. They break when styles are refactored. Flag them and suggest `getByRole()` or `getByLabel()` alternatives.
- **Selectors that rely on DOM position** — `.product-card:nth-child(2)` or `.locator('.items > div').nth(3)` break when the DOM order changes. Flag them.
- **Selectors with no stable anchor** — If a locator selects multiple elements and the test uses `.first()` without a comment explaining why the first element is the right one, flag it.
- **XPath selectors** — Playwright has better alternatives. Flag any XPath.
- **Selectors that duplicate what a page object already provides** — If `CartPage` already exposes `.checkoutBtn` but the test uses `page.locator('.checkout-btn')` directly, that's a leaky abstraction. Flag it.
- **Selectors that don't match the actual DOM** — Cross-reference against the React source you read. If a test uses `.product-link` but the component renders `<a className="product-name">`, flag the mismatch.

---

### Category 2 — Timing and waits

- **`page.waitForTimeout()` usage** — This is banned in Playwright best practices. Any use of it is a CRITICAL finding. Suggest the correct wait strategy:
  - After navigation: `page.waitForURL('/path')` or `expect(page).toHaveURL('/path')`
  - After async DOM change: `await expect(locator).toBeVisible()`
  - After data load: `await locator.waitFor({ state: 'visible' })`
  - After dialog: `page.waitForEvent('dialog')` registered BEFORE the triggering action
- **`page.waitForSelector()` with a string selector** — The older string-based API is discouraged. `await page.waitForSelector('.product-card')` should be `await page.locator('.product-card').first().waitFor({ state: 'visible' })`.
- **No wait before asserting on dynamic content** — If a test clicks something that triggers a network request or animation and then immediately asserts on the result, there may be a race. Playwright auto-waiting helps but isn't infallible — flag cases where a `waitFor` would make intent explicit.
- **Dialog race conditions** — `page.once('dialog', ...)` must be registered BEFORE the action that triggers the dialog, not after. Flag reversed order.

---

### Category 3 — Assertion completeness

- **Missing assertions** — A test that performs 5 actions but only asserts at the end is missing intermediate checkpoints. Flag flows where key state changes (modal appearing, cart count updating, price recalculating) go unasserted.
- **Weak assertions** — `expect(element).toBeVisible()` is necessary but not sufficient — it doesn't verify content. After adding a product to the cart, you should also assert the product name matches, not just that `.cart-item` is visible.
- **`textContent()` comparison anti-pattern** — `expect(await locator.textContent()).toBe('...')` bypasses Playwright's auto-retry. It must be `expect(locator).toHaveText('...')` or `toContainText('...')`.
- **Raw `parseFloat`/`replace` for price assertions** — If the test does manual string parsing to compare prices, flag it. The `CartPage.parsePrice()` utility exists for this; reuse it, or use `toContainText('$29.99')` where exact value isn't needed.
- **No assertion on navigation** — After a click that should navigate, `expect(page).toHaveURL('/target')` must be present. Flag tests that navigate without asserting the new URL.
- **`console.log` used instead of assertions** — `console.log('Cart is not empty, count: ' + count)` is not a test assertion. It logs a failure but never fails the test. Flag and replace with `expect(count).toBe(0)`.

---

### Category 4 — Test isolation and cleanup

- **No `beforeEach` cart cleanup** — Cart state lives in `localStorage`. Any test that interacts with the cart must have `await page.evaluate(() => localStorage.removeItem('cart'))` in a `beforeEach`. Flag tests that lack this.
- **Tests that depend on execution order** — If a test assumes a previous test already added a product or navigated somewhere, flag it. Each test must set up its own preconditions.
- **Hard-coded test data that could conflict** — If tests use real email addresses or usernames that persist in the database across runs, repeated test runs will create duplicate-user errors. Flag hardcoded emails and suggest unique generation or cleanup.
- **Missing `afterEach`/`afterAll` cleanup** — If a test creates server-side resources (orders, users), those should be cleaned up or the tests should use isolated data to avoid polluting other test runs.

---

### Category 5 — Page object usage

- **Direct `page.locator()` calls in spec files** — When a locator for a UI element already exists in a page object, the spec should use the page object, not re-declare the locator. Duplication means selector changes require updates in multiple places.
- **Missing page objects for complex pages** — If a test interacts with 5+ elements on the same page without a page object, flag it as a maintainability issue.
- **Page object methods doing assertions** — `expect()` calls inside page object methods are an anti-pattern. Page objects are action/query layers; assertions belong in spec files. Flag any `expect` inside a page object.
- **Page objects not extending `BasePage`** — Existing convention: all page objects extend `BasePage` for `navigate()` and `waitForPageLoad()`. Flag any that don't.
- **Inconsistent constructor patterns** — All page objects declare locators as `readonly` properties initialized in the constructor. Flag any that use lazy initialization or method-local `page.locator()` calls.

---

### Category 6 — Structure and naming

- **Flat test organization** — Tests covering multiple distinct scenarios should be grouped into nested `describe` blocks. A single `describe` with 10 tests is a smell if those tests cover unrelated flows.
- **Vague test names** — `"test 1"`, `"should work"`, `"checkout test"` are unacceptable. Names must be full English sentences stating the observable outcome: `"redirects to the home page after a successful order"`.
- **`test.only` or `test.skip` left in the file** — These are development aids. Flag any that made it into the committed file.
- **Commented-out test code** — Flag it. Either the test is needed (uncomment and fix it) or it isn't (delete it).
- **Overlapping test coverage** — If two tests exercise the exact same flow with no meaningful variation, one is redundant. Flag duplicates.

---

### Category 7 — TypeScript quality

- **`any` types** — Every value should be typed. Flag `any`.
- **Non-null assertion operator (`!`) without comment** — `locator.textContent()!` suppresses a potentially null value without explaining why null can't happen here. Flag unguarded `!` usage and suggest the nullish coalescing pattern the project uses: `?? ''`.
- **`as unknown as X` double casts** — Usually a sign of a type mismatch being papered over. Flag them.

---

## Step 3 — Format your findings

Output a structured report in this exact format:

```
## UI Test Review: [filename]

### Summary
X issues found across Y categories. [One sentence overall assessment.]

---

### [CRITICAL / HIGH / MEDIUM / LOW] — [Category Name]
**Line [N]:** [What the issue is]
**Why it matters:** [The risk or failure mode]
**Fix:**
\`\`\`typescript
// suggested replacement
\`\`\`

---
[repeat for each finding]

---

### What's working well
- [2-4 things done correctly — good selector choices, proper wait patterns, solid assertions]
```

Severity definitions:
- **CRITICAL** — Test passes when it should fail, race condition that causes flakiness, selector that already doesn't match the DOM
- **HIGH** — Assertion gap that lets regressions through, cleanup failure that causes test pollution, timing issue likely to cause flakiness
- **MEDIUM** — Fragile selector, missing page object abstraction, isolation issue that may cause failures on repeated runs
- **LOW** — Naming, structure, readability, TypeScript style

Order findings by severity descending. If no issues are found in a category, omit that category.
