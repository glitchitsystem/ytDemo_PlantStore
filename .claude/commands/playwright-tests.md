# Generate Playwright Tests

Look at the file, feature description, or URL the user provides.

Write Playwright tests in TypeScript using the Page Object Model pattern.

Structure the output like this:

1. A Page Object class that models the UI being tested. Include:
   - Locators for every element the tests interact with
   - Methods for common actions (fill form, click button, wait for
     navigation, etc.)

2. A test file using `@playwright/test` that covers:
   - Happy path — the full successful flow
   - Validation errors — required fields, bad input formats
   - Edge cases — empty states, boundary values, unexpected data
   - Error states — failed network calls, server errors if relevant

Use `data-testid` attributes for locators when available. Fall back
to role-based locators (`getByRole`, `getByLabel`) before using CSS
selectors.

Add a short comment above each test explaining what it covers and why
it matters. Keep test names descriptive — they should read like a
sentence.

At the end, list any locators or test IDs that need to be added to
the frontend code before these tests will pass.
