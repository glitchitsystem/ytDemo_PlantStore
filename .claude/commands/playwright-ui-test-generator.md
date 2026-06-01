---
description: Generate a Playwright TypeScript UI test for a described user flow. Reads existing tests and page objects first so the output matches project patterns, selectors, and file structure exactly.
argument-hint: "Describe the user flow to test — e.g. 'user adds two products to cart then removes one and verifies total updates'"
---

You are an expert UI test automation engineer working on the Plant Store project. Your job is to generate a production-ready Playwright TypeScript test — and any required page object updates — for the user flow described in: $ARGUMENTS

## Step 1 — Read ALL existing test infrastructure before writing anything

Read every file listed below. Understanding existing patterns is mandatory — the generated test must be indistinguishable in style from what already exists.

**Existing tests:**
- `tests/cart-checkout.spec.ts`

**Existing page objects:**
- `tests/pages/BasePage.ts`
- `tests/pages/CartPage.ts`
- `tests/pages/ProductsPage.ts`
- `tests/pages/LoginPage.ts`

**Config:**
- `playwright.config.ts`

**Client source** — read the relevant React components to understand what CSS classes, ARIA labels, and roles are actually rendered in the DOM:
- `client/src/` — glob for `.js` files related to the flow being tested (Cart, Checkout, Products, Login, etc.)

## Step 2 — Analyze the flow

Based on `$ARGUMENTS` and what you read, identify:

1. **Which pages are involved** — map each step to an existing page object or flag that a new one is needed
2. **Which selectors to use** — prefer in this order:
   - `getByRole()` with accessible name (most resilient)
   - `getByLabel()` for form fields
   - `page.locator()` with CSS class (matches existing pattern in this project)
   - Never use XPath, `id` attributes that look auto-generated, or positional nth-child selectors
3. **What state must be set up** — cart state lives in `localStorage`; clear it in `beforeEach` with `page.evaluate(() => localStorage.removeItem('cart'))`
4. **What assertions prove the flow succeeded** — identify at least one assertion per meaningful state change, not just at the end

## Step 3 — Decide on page object changes

For each page involved in the flow:

**If an existing page object has the needed locators and methods** → use it as-is. Import it.

**If an existing page object is missing a locator or method needed for this flow** → extend it. Output the updated page object file with additions appended following the same style (readonly Locator properties in constructor, async methods for actions).

**If the flow involves a page with no page object yet** → create a new `tests/pages/[Name]Page.ts` that extends `BasePage`. Follow this exact template:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class [Name]Page extends BasePage {
  readonly [locatorName]: Locator;
  // ... more locators

  constructor(page: Page) {
    super(page);
    this.[locatorName] = page.locator('[selector]');
    // ... more assignments
  }

  async goto() {
    await this.navigate('/[path]');
  }

  async [actionMethod]() {
    // single responsibility — one meaningful action per method
  }
}
```

Rules for page objects:
- All locators are `readonly` and initialized in the constructor
- Action methods are `async` and do one thing
- No assertions inside page objects — assertions belong in tests
- `parsePrice(text: string): number` utility lives in CartPage; import and reuse, do not duplicate

## Step 4 — Write the spec file

Generate `tests/[flow-name].spec.ts`. Follow this structure exactly:

```typescript
import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';
// ... other page object imports

test.describe('[Feature or page name]', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));
  });

  test('[plain English description of what should happen]', async ({ page }) => {
    // Arrange — set up any preconditions via page object actions
    // Act — perform the user flow steps
    // Assert — verify the expected outcomes with expect()
  });

  // Additional tests for variations and edge cases of the same flow

});
```

Assertion rules:
- Use `expect(locator).toBeVisible()` to confirm elements appear
- Use `expect(locator).toHaveText()` or `.toContainText()` for text content
- Use `expect(page).toHaveURL()` after navigation
- Use `expect(locator).toHaveCount(n)` for list lengths
- Use `.toBeCloseTo(n, 2)` for price arithmetic (matches existing cart tests)
- Never use `expect(await locator.textContent()).toBe(...)` — use the locator-based matchers
- Never assert only at the end — assert after each meaningful state change

Timing rules:
- Never use `page.waitForTimeout()` — it is banned
- Use `waitFor({ state: 'visible' })` after navigation to dynamic content
- Prefer auto-waiting Playwright locators; only add explicit waits when a locator's auto-wait isn't enough
- Use `page.waitForURL('/path')` after clicks that trigger navigation
- Use `page.waitForEvent('dialog')` before the action that triggers it — not after

Dialog handling (match existing pattern):
```typescript
// Pattern A — when you don't need to inspect the message:
page.once('dialog', (dialog) => dialog.accept());
await triggerAction();

// Pattern B — when you need to assert dialog content:
const dialogPromise = page.waitForEvent('dialog');
await triggerAction();
const dialog = await dialogPromise;
expect(dialog.message()).toContain('expected text');
await dialog.accept();
```

## Step 5 — Quality checklist (verify before output)

- [ ] Every locator matches the CSS classes or ARIA labels that actually exist in the client source code you read in Step 1
- [ ] `beforeEach` clears localStorage cart state
- [ ] No `waitForTimeout` anywhere in the file
- [ ] Assertions use locator-based matchers (not `textContent()` comparisons)
- [ ] Each test is self-contained — no shared mutable state between tests
- [ ] Page object methods do actions only; assertions are in spec files only
- [ ] New page objects extend `BasePage`
- [ ] File uses `import { test, expect } from '@playwright/test'` (not a custom fixture file unless one already exists)
- [ ] Test names are full sentences describing observable behavior

## Step 6 — Output

If new or modified page objects are needed, output them first with a header comment showing the file path. Then output the spec file. No prose, just code.

Format:
```
// tests/pages/[Name]Page.ts  (new file / updated file)
[page object code]

// tests/[flow-name].spec.ts
[spec code]
```
