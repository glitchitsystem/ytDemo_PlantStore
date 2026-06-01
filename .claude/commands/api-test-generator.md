---
description: Generate a comprehensive TypeScript API test file for a described endpoint. Covers happy path, validation errors, auth errors, and edge cases — matched to project conventions.
argument-hint: "[HTTP method] [endpoint path] — e.g. POST /api/orders or GET /api/products/:id"
---

You are an expert API test automation engineer working on the Plant Store project. Your job is to generate a complete, production-ready TypeScript API test file for the endpoint described in: $ARGUMENTS

## Step 1 — Read project context before writing a single line of test code

Read all of these files to understand existing conventions. Do NOT skip any:

1. Read `server/server.js` — understand middleware, error response shapes, auth setup
2. Read `server/routes/auth.js` — understand auth endpoints, JWT flow, request/response shapes
3. Read `tests/cart-checkout.spec.ts` — understand test style, describe/test structure, assertion style
4. Read `tests/pages/BasePage.ts`, `tests/pages/CartPage.ts`, `tests/pages/ProductsPage.ts`, `tests/pages/LoginPage.ts` — understand POM conventions

Also read `server/initDatabase.js` to understand seeded data (products, users) you can rely on in tests.

## Step 2 — Identify the target endpoint

Based on `$ARGUMENTS`, locate the relevant route handler in the server code. Read the exact:
- Request body schema (required vs optional fields, types)
- Response body schema (success and error shapes)
- Auth requirements (none / optional / required JWT)
- Status codes returned for each case
- Business logic that can produce different outcomes (e.g. stock validation, duplicate email)

## Step 3 — Design the test data factory

Before writing tests, define a typed data factory at the top of the file. Follow these rules:
- Every factory function must return a fully typed object (no `any`)
- Factories must accept partial overrides: `(overrides: Partial<T> = {}): T`
- Use realistic but deterministic test data (no `Math.random()`)
- Prefix test emails with `test_` and use `@example.com` domain to avoid collisions
- If the endpoint requires auth, include a `createAuthHeaders(token: string)` helper

Example factory pattern to follow:
```typescript
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

function buildRegisterPayload(overrides: Partial<RegisterPayload> = {}): RegisterPayload {
  return {
    name: 'Test User',
    email: 'test_user@example.com',
    password: 'Password123!',
    ...overrides,
  };
}
```

## Step 4 — Write the test file

Generate a complete `tests/api/[endpoint-name].spec.ts` file with this exact structure:

```typescript
import { test, expect } from '@playwright/test';

// --- Types ---
// (all request/response interfaces)

// --- Factories ---
// (all builder functions with Partial<T> overrides)

// --- Helpers ---
// (auth token helper if needed, base URL constant)

const API_BASE = 'http://localhost:5001/api';

test.describe('[METHOD] [/endpoint/path]', () => {

  test.describe('happy path', () => {
    // Successful request with valid data
    // Assert: correct status code, response shape, key field values
  });

  test.describe('validation errors', () => {
    // Missing required fields (test each one individually)
    // Invalid field formats (bad email, short password, negative numbers, etc.)
    // Assert: 400 status, error message present in response
  });

  test.describe('auth errors', () => {
    // Only if endpoint requires auth:
    // No token → 401
    // Malformed token → 401
    // Expired/invalid token → 401
  });

  test.describe('edge cases', () => {
    // Business logic boundaries from the server code
    // e.g. out-of-stock, duplicate records, empty arrays, max quantities
    // Concurrent or state-dependent scenarios if applicable
  });

});
```

## Step 5 — Quality checklist (apply before outputting)

Before writing your final answer, verify every test:

- [ ] Uses `request` fixture from `@playwright/test` for HTTP calls — NOT `fetch` or `axios` (Playwright has built-in API testing via `APIRequestContext`)
- [ ] Asserts **both** the HTTP status code AND the response body shape — never just one
- [ ] Uses the factory functions — no inline hardcoded request bodies
- [ ] Each test is independent — no test relies on state from a previous test
- [ ] Auth tests use a real token obtained via `POST /api/auth/login` in a `beforeAll` block, not a fake string
- [ ] Describe blocks are nested: outer = endpoint, inner = scenario category
- [ ] Test names are plain English sentences describing the expected outcome: `"returns 400 when email is missing"` not `"email test"`
- [ ] No `page.waitForTimeout()` or arbitrary sleeps
- [ ] No `console.log` left in the file

## Step 6 — Output

Emit only the complete TypeScript file contents. No prose before or after. Add the path as a comment on line 1:
```typescript
// tests/api/[filename].spec.ts
```
