# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login page >> displays error when network request fails
- Location: tests\login.spec.ts:98:7

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator: getByRole('button', { name: /login/i })
Expected: enabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeEnabled" with timeout 5000ms
  - waiting for getByRole('button', { name: /login/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "🌱 PlantShop" [ref=e6] [cursor=pointer]:
          - /url: /
        - navigation [ref=e7]:
          - link "Home" [ref=e8] [cursor=pointer]:
            - /url: /
          - link "Products" [ref=e9] [cursor=pointer]:
            - /url: /products
          - link "🛍️ Cart (0)" [ref=e10] [cursor=pointer]:
            - /url: /cart
            - generic [ref=e11]: 🛍️
            - generic [ref=e12]: Cart
            - generic [ref=e13]: (0)
          - link "Register" [ref=e15] [cursor=pointer]:
            - /url: /register
    - main [ref=e16]:
      - generic [ref=e18]:
        - heading "Login" [level=2] [ref=e19]
        - generic [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: "Email:"
            - textbox "Email:" [ref=e23]: test@example.com
          - generic [ref=e24]:
            - generic [ref=e25]: "Password:"
            - textbox "Password:" [ref=e26]: password123
          - button "Logging in..." [disabled] [ref=e27]
        - paragraph [ref=e28]:
          - text: Don't have an account?
          - link "Register here" [ref=e29] [cursor=pointer]:
            - /url: /register
    - contentinfo [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - heading "GreenThumb Garden" [level=3] [ref=e34]
            - paragraph [ref=e35]: Your trusted source for beautiful, healthy plants and garden accessories.
            - generic [ref=e36]:
              - generic [ref=e37]: "Follow us:"
              - button "Facebook" [ref=e38] [cursor=pointer]: 📘
              - button "Instagram" [ref=e39] [cursor=pointer]: 📷
              - button "Twitter" [ref=e40] [cursor=pointer]: 🐦
          - generic [ref=e41]:
            - heading "Quick Links" [level=4] [ref=e42]
            - list [ref=e43]:
              - listitem [ref=e44]:
                - link "Home" [ref=e45] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e46]:
                - link "Products" [ref=e47] [cursor=pointer]:
                  - /url: /products
              - listitem [ref=e48]:
                - link "Cart" [ref=e49] [cursor=pointer]:
                  - /url: /cart
              - listitem [ref=e50]:
                - link "About Us" [ref=e51] [cursor=pointer]:
                  - /url: /about
          - generic [ref=e52]:
            - heading "Categories" [level=4] [ref=e53]
            - list [ref=e54]:
              - listitem [ref=e55]:
                - link "Indoor Plants" [ref=e56] [cursor=pointer]:
                  - /url: /products?category=Indoor Plants
              - listitem [ref=e57]:
                - link "Herbs" [ref=e58] [cursor=pointer]:
                  - /url: /products?category=Herbs
              - listitem [ref=e59]:
                - link "Succulents" [ref=e60] [cursor=pointer]:
                  - /url: /products?category=Succulents
              - listitem [ref=e61]:
                - link "Accessories" [ref=e62] [cursor=pointer]:
                  - /url: /products?category=Accessories
          - generic [ref=e63]:
            - heading "Customer Service" [level=4] [ref=e64]
            - list [ref=e65]:
              - listitem [ref=e66]:
                - link "Contact Us" [ref=e67] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e68]:
                - link "Shipping Info" [ref=e69] [cursor=pointer]:
                  - /url: /shipping
              - listitem [ref=e70]:
                - link "Returns" [ref=e71] [cursor=pointer]:
                  - /url: /returns
              - listitem [ref=e72]:
                - link "Plant Care Guide" [ref=e73] [cursor=pointer]:
                  - /url: /care
        - generic [ref=e74]:
          - paragraph [ref=e75]: © 2026 GreenThumb Garden. All rights reserved.
          - paragraph [ref=e76]:
            - text: Images sourced from
            - link "Unsplash" [ref=e77] [cursor=pointer]:
              - /url: https://unsplash.com
  - iframe [ref=e78]:
    - generic [ref=f1e2]:
      - generic [ref=f1e3]: "Uncaught runtime errors:"
      - button "Dismiss" [ref=f1e4] [cursor=pointer]: ×
      - generic [ref=f1e6]:
        - generic [ref=f1e7]: ERROR
        - generic [ref=f1e8]: "Failed to fetch TypeError: Failed to fetch at login (http://localhost:3000/static/js/bundle.js:39000:28) at handleSubmit (http://localhost:3000/static/js/bundle.js:37081:26) at executeDispatch (http://localhost:3000/static/js/bundle.js:19771:7) at runWithFiberInDEV (http://localhost:3000/static/js/bundle.js:11123:68) at processDispatchQueue (http://localhost:3000/static/js/bundle.js:19799:31) at http://localhost:3000/static/js/bundle.js:20096:7 at batchedUpdates$1 (http://localhost:3000/static/js/bundle.js:12414:38) at dispatchEventForPluginEventSystem (http://localhost:3000/static/js/bundle.js:19875:5) at dispatchEvent (http://localhost:3000/static/js/bundle.js:22073:31) at dispatchDiscreteEvent (http://localhost:3000/static/js/bundle.js:22055:58)"
```

# Test source

```ts
  4   | const VALID_EMAIL = 'test@example.com';
  5   | const VALID_PASSWORD = 'password123';
  6   | 
  7   | test.describe('Login page', () => {
  8   |   let loginPage: LoginPage;
  9   | 
  10  |   test.beforeEach(async ({ page }) => {
  11  |     loginPage = new LoginPage(page);
  12  |     await loginPage.goto();
  13  |   });
  14  | 
  15  |   // Happy path: valid credentials log the user in and redirect to home
  16  |   test('successful login redirects to home page', async ({ page }) => {
  17  |     await page.route('/api/auth/login', (route) =>
  18  |       route.fulfill({
  19  |         status: 200,
  20  |         contentType: 'application/json',
  21  |         body: JSON.stringify({ token: 'fake-jwt', user: { id: 1, email: VALID_EMAIL, name: 'Test User' } }),
  22  |       })
  23  |     );
  24  |     // /api/auth/me is called on mount when token is set
  25  |     await page.route('/api/auth/me', (route) =>
  26  |       route.fulfill({
  27  |         status: 200,
  28  |         contentType: 'application/json',
  29  |         body: JSON.stringify({ user: { id: 1, email: VALID_EMAIL, name: 'Test User' } }),
  30  |       })
  31  |     );
  32  | 
  33  |     await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  34  |     await expect(page).toHaveURL('/');
  35  |   });
  36  | 
  37  |   // Happy path: button shows loading state while the request is in-flight
  38  |   test('submit button shows loading text while request is pending', async ({ page }) => {
  39  |     let resolveRequest!: (value: unknown) => void;
  40  |     await page.route('/api/auth/login', (route) =>
  41  |       new Promise((res) => { resolveRequest = res; }).then(() =>
  42  |         route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'x', user: {} }) })
  43  |       )
  44  |     );
  45  | 
  46  |     await loginPage.emailInput.fill(VALID_EMAIL);
  47  |     await loginPage.passwordInput.fill(VALID_PASSWORD);
  48  |     await loginPage.submitButton.click();
  49  | 
  50  |     await expect(loginPage.submitButton).toBeDisabled();
  51  |     await expect(loginPage.submitButton).toHaveText('Logging in...');
  52  | 
  53  |     resolveRequest(null);
  54  |   });
  55  | 
  56  |   // Error state: server returns invalid credentials
  57  |   test('displays error message on invalid credentials', async ({ page }) => {
  58  |     await page.route('/api/auth/login', (route) =>
  59  |       route.fulfill({
  60  |         status: 401,
  61  |         contentType: 'application/json',
  62  |         body: JSON.stringify({ error: 'Invalid email or password' }),
  63  |       })
  64  |     );
  65  | 
  66  |     await loginPage.login(VALID_EMAIL, 'wrongpassword');
  67  |     await expect(loginPage.errorMessage).toBeVisible();
  68  |     await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
  69  |   });
  70  | 
  71  |   // Error state: previous error clears when a new submission starts
  72  |   test('clears error message when form is resubmitted', async ({ page }) => {
  73  |     await page.route('/api/auth/login', (route) =>
  74  |       route.fulfill({
  75  |         status: 401,
  76  |         contentType: 'application/json',
  77  |         body: JSON.stringify({ error: 'Invalid email or password' }),
  78  |       })
  79  |     );
  80  | 
  81  |     await loginPage.login(VALID_EMAIL, 'wrongpassword');
  82  |     await expect(loginPage.errorMessage).toBeVisible();
  83  | 
  84  |     // Unroute so second attempt succeeds
  85  |     await page.unroute('/api/auth/login');
  86  |     await page.route('/api/auth/login', (route) =>
  87  |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'x', user: {} }) })
  88  |     );
  89  |     await page.route('/api/auth/me', (route) =>
  90  |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: {} }) })
  91  |     );
  92  | 
  93  |     await loginPage.submitButton.click();
  94  |     await expect(loginPage.errorMessage).not.toBeVisible();
  95  |   });
  96  | 
  97  |   // Error state: network failure shows a meaningful error
  98  |   test('displays error when network request fails', async ({ page }) => {
  99  |     await page.route('/api/auth/login', (route) => route.abort());
  100 | 
  101 |     await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  102 |     // The component sets error from result.error; a network abort causes fetch to throw,
  103 |     // which propagates as an unhandled rejection — verify the form is at least still usable
> 104 |     await expect(loginPage.submitButton).toBeEnabled();
      |                                          ^ Error: expect(locator).toBeEnabled() failed
  105 |   });
  106 | 
  107 |   // Validation: HTML5 required fields prevent submission with empty inputs
  108 |   test('does not submit when email field is empty', async ({ page }) => {
  109 |     const requestMade = { called: false };
  110 |     await page.route('/api/auth/login', () => { requestMade.called = true; });
  111 | 
  112 |     await loginPage.passwordInput.fill(VALID_PASSWORD);
  113 |     await loginPage.submitButton.click();
  114 | 
  115 |     // Browser native validation blocks form submission
  116 |     await expect(page).toHaveURL('/login');
  117 |     expect(requestMade.called).toBe(false);
  118 |   });
  119 | 
  120 |   // Validation: empty password field is blocked by required attribute
  121 |   test('does not submit when password field is empty', async ({ page }) => {
  122 |     const requestMade = { called: false };
  123 |     await page.route('/api/auth/login', () => { requestMade.called = true; });
  124 | 
  125 |     await loginPage.emailInput.fill(VALID_EMAIL);
  126 |     await loginPage.submitButton.click();
  127 | 
  128 |     await expect(page).toHaveURL('/login');
  129 |     expect(requestMade.called).toBe(false);
  130 |   });
  131 | 
  132 |   // Validation: malformed email is rejected by the browser before a request is made
  133 |   test('does not submit with an invalid email format', async ({ page }) => {
  134 |     const requestMade = { called: false };
  135 |     await page.route('/api/auth/login', () => { requestMade.called = true; });
  136 | 
  137 |     await loginPage.emailInput.fill('not-an-email');
  138 |     await loginPage.passwordInput.fill(VALID_PASSWORD);
  139 |     await loginPage.submitButton.click();
  140 | 
  141 |     await expect(page).toHaveURL('/login');
  142 |     expect(requestMade.called).toBe(false);
  143 |   });
  144 | 
  145 |   // Navigation: register link goes to /register
  146 |   test('register link navigates to the registration page', async ({ page }) => {
  147 |     await loginPage.registerLink.click();
  148 |     await expect(page).toHaveURL('/register');
  149 |   });
  150 | 
  151 |   // Edge case: already-logged-in users who land on /login can still see the form
  152 |   test('login form renders all expected fields and controls', async () => {
  153 |     await expect(loginPage.emailInput).toBeVisible();
  154 |     await expect(loginPage.passwordInput).toBeVisible();
  155 |     await expect(loginPage.submitButton).toBeVisible();
  156 |     await expect(loginPage.registerLink).toBeVisible();
  157 |   });
  158 | });
  159 | 
```