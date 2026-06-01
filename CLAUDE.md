# Plant Store — Claude Context

## What this project is

Full-stack ecommerce app for selling plants. React frontend (port 3000), Express + SQLite backend (port 5001). Playwright for E2E and API testing.

## Running the project

```bash
npm run dev          # starts both client and server concurrently
npm run test:e2e     # run Playwright tests (headless)
npm run test:e2e:ui  # Playwright UI mode
```

Server must be running for tests. `playwright.config.ts` auto-starts it via `webServer`.

Swagger UI: http://localhost:5001/api-docs

## Architecture

```
client/          React 19 frontend (Create React App, proxy → :5001)
server/          Express 4 backend
  server.js      All routes except auth; DB init; middleware
  routes/auth.js Auth router mounted at /api/auth
  swagger.js     OpenAPI 3.0 spec (all endpoints documented here)
  initDatabase.js SQLite schema + seed data
tests/
  *.spec.ts      Playwright test specs
  pages/         Page Object Model classes
playwright.config.ts
```

## API surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | — | All products |
| GET | /api/products/:id | — | Single product |
| GET | /api/products/category/:category | — | Products by category |
| GET | /api/categories | — | Distinct category list |
| POST | /api/auth/register | — | Register `{ name, email, password }` → `{ user, token }` |
| POST | /api/auth/login | — | Login `{ email, password }` → `{ user, token }` |
| GET | /api/auth/me | Bearer JWT | Current user profile |
| POST | /api/orders | — | Place order `{ items, total, shipping }` |

JWT tokens expire in 24 h. Auth header format: `Authorization: Bearer <token>`.

The `POST /api/orders` endpoint validates stock before inserting. If any item exceeds available stock it returns `400 { errors, adjustedItems }` — the order is **not** created.

## Database

SQLite file at `server/ecommerce.db`. Three tables: `users`, `products`, `orders`.

Seeded products on first run:
- Snake Plant — $29.99 — Indoor Plants — stock 15
- Fiddle Leaf Fig — $49.99 — Indoor Plants — stock 8
- Monstera Deliciosa — $39.99 — Indoor Plants — stock 12
- Lavender Plant — $24.99 — Outdoor Plants — stock 20

## Testing conventions

### File locations
- UI specs → `tests/*.spec.ts`
- API specs → `tests/api/*.spec.ts`
- Page objects → `tests/pages/[Name]Page.ts`

### Page Object Model rules
- All page objects extend `BasePage` (`tests/pages/BasePage.ts`)
- Locators are `readonly` properties initialized in the constructor
- Methods are `async` and perform one action each
- **No `expect()` calls inside page objects** — assertions belong in spec files only
- `CartPage.parsePrice(text)` is the canonical price-string parser — do not duplicate it

### Spec file rules
- `beforeEach` must clear cart state: `await page.evaluate(() => localStorage.removeItem('cart'))`
- `waitForTimeout` is banned — use locator auto-waiting or `waitFor({ state: 'visible' })`
- `waitForSelector(string)` is deprecated — use `locator.waitFor()`
- Register `page.once('dialog', ...)` **before** the action that triggers the dialog
- Use `toBeCloseTo(n, 2)` for price arithmetic assertions
- Use locator-based matchers (`toHaveText`, `toBeVisible`) not `textContent()` comparisons
- Test names are full English sentences: `"redirects to home page after order is placed"`

### API test rules
- Use Playwright's `request` fixture — not `axios` or `fetch`
- Every test asserts both HTTP status code and response body shape
- Use typed data factory functions with `Partial<T>` override pattern
- Each test is fully independent — no shared state between tests

### Selector priority (most to least preferred)
1. `getByRole()` with accessible name
2. `getByLabel()` for form fields
3. `page.locator('.css-class')` matching an existing class in the React source
4. Never XPath, never auto-generated `id` attributes

## Key CSS classes (React → DOM)

```
.product-card          Product listing card
.product-name          Product name text
.add-to-cart-btn       Add to cart button on product card
.modal-content         Post-add-to-cart confirmation modal
.view-cart             "View Cart" link inside modal
.continue-shopping     "Continue Shopping" button inside modal
.modal-close           Close button on modal
.cart-item             Individual cart row
.cart-item-price       Unit price in cart row
.cart-item-total       Line total (qty × price) in cart row
.cart-item-quantity    Quantity controls wrapper
.quantity              Quantity display text
.quantity-btn          Increase/decrease buttons (aria-label on each)
.cart-summary          Order summary section
.checkout-btn          "Proceed to Checkout" button
.remove-btn            Remove item button
.place-order-btn       Submit order button on checkout page
.error-message         Inline form/auth error text
```

Form field IDs on the checkout page: `#name`, `#email`, `#address`, `#city`, `#zipCode`, `#phone`.

## Custom skills

These slash commands are available in this project:

| Command | Usage |
|---------|-------|
| `/api-test-generator` | Describe an endpoint → get a full typed API test file |
| `/playwright-ui-test-generator` | Describe a user flow → get a Playwright spec + page object updates |
| `/api-test-code-review` | Pass a test file path → get prioritized findings with fixes |
| `/ui-test-code-review` | Pass a test file path → get Playwright-specific quality review |
| `/bug-explorer` | Describe a bug → get root cause traced to file:line |

## What to avoid

- Do not add `console.log` assertions in tests — use `expect()`
- Do not use `waitForTimeout` anywhere
- Do not add `swagger-jsdoc` inline annotations to route handlers — the spec lives entirely in `server/swagger.js`
- Do not use `axios` or `fetch` in Playwright tests — use the `request` fixture
- Do not create new page objects that don't extend `BasePage`
- Do not put `expect()` calls inside page object methods
