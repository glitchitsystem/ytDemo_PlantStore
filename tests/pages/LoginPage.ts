import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email:');
    this.passwordInput = page.getByLabel('Password:');
    this.submitButton = page.getByRole('button', { name: /login/i });
    this.errorMessage = page.locator('.error-message');
    this.registerLink = page.getByRole('link', { name: /register here/i });
  }

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
