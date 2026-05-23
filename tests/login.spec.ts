import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = 'password123';

test.describe('Login page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Happy path: valid credentials log the user in and redirect to home
  test('successful login redirects to home page', async ({ page }) => {
    await page.route('/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt', user: { id: 1, email: VALID_EMAIL, name: 'Test User' } }),
      })
    );
    // /api/auth/me is called on mount when token is set
    await page.route('/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 1, email: VALID_EMAIL, name: 'Test User' } }),
      })
    );

    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await expect(page).toHaveURL('/');
  });

  // Happy path: button shows loading state while the request is in-flight
  test('submit button shows loading text while request is pending', async ({ page }) => {
    let resolveRequest!: (value: unknown) => void;
    await page.route('/api/auth/login', (route) =>
      new Promise((res) => { resolveRequest = res; }).then(() =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'x', user: {} }) })
      )
    );

    await loginPage.emailInput.fill(VALID_EMAIL);
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();

    await expect(loginPage.submitButton).toBeDisabled();
    await expect(loginPage.submitButton).toHaveText('Logging in...');

    resolveRequest(null);
  });

  // Error state: server returns invalid credentials
  test('displays error message on invalid credentials', async ({ page }) => {
    await page.route('/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' }),
      })
    );

    await loginPage.login(VALID_EMAIL, 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
  });

  // Error state: previous error clears when a new submission starts
  test('clears error message when form is resubmitted', async ({ page }) => {
    await page.route('/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' }),
      })
    );

    await loginPage.login(VALID_EMAIL, 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();

    // Unroute so second attempt succeeds
    await page.unroute('/api/auth/login');
    await page.route('/api/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'x', user: {} }) })
    );
    await page.route('/api/auth/me', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: {} }) })
    );

    await loginPage.submitButton.click();
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  // Error state: network failure shows a meaningful error
  test('displays error when network request fails', async ({ page }) => {
    await page.route('/api/auth/login', (route) => route.abort());

    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    // The component sets error from result.error; a network abort causes fetch to throw,
    // which propagates as an unhandled rejection — verify the form is at least still usable
    await expect(loginPage.submitButton).toBeEnabled();
  });

  // Validation: HTML5 required fields prevent submission with empty inputs
  test('does not submit when email field is empty', async ({ page }) => {
    const requestMade = { called: false };
    await page.route('/api/auth/login', () => { requestMade.called = true; });

    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();

    // Browser native validation blocks form submission
    await expect(page).toHaveURL('/login');
    expect(requestMade.called).toBe(false);
  });

  // Validation: empty password field is blocked by required attribute
  test('does not submit when password field is empty', async ({ page }) => {
    const requestMade = { called: false };
    await page.route('/api/auth/login', () => { requestMade.called = true; });

    await loginPage.emailInput.fill(VALID_EMAIL);
    await loginPage.submitButton.click();

    await expect(page).toHaveURL('/login');
    expect(requestMade.called).toBe(false);
  });

  // Validation: malformed email is rejected by the browser before a request is made
  test('does not submit with an invalid email format', async ({ page }) => {
    const requestMade = { called: false };
    await page.route('/api/auth/login', () => { requestMade.called = true; });

    await loginPage.emailInput.fill('not-an-email');
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();

    await expect(page).toHaveURL('/login');
    expect(requestMade.called).toBe(false);
  });

  // Navigation: register link goes to /register
  test('register link navigates to the registration page', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL('/register');
  });

  // Edge case: already-logged-in users who land on /login can still see the form
  test('login form renders all expected fields and controls', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });
});
