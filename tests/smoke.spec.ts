import { test, expect } from '@playwright/test';

// Smoke test: verifies the app loads and the home page is reachable
test('home page loads successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/plant/i);
});
