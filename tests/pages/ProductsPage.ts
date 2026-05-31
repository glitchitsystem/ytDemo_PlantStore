import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;
  readonly modalContent: Locator;
  readonly modalViewCartLink: Locator;
  readonly modalContinueShoppingBtn: Locator;
  readonly modalCloseBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator('.product-card');
    this.addToCartButtons = page.locator('.add-to-cart-btn');
    this.modalContent = page.locator('.modal-content');
    this.modalViewCartLink = page.locator('.view-cart');
    this.modalContinueShoppingBtn = page.locator('.continue-shopping');
    this.modalCloseBtn = page.locator('.modal-close');
  }

  async goto() {
    await this.page.goto('/products');
    await this.productCards.first().waitFor({ state: 'visible' });
  }

  /** Returns the visible text of the first product's name link */
  async getFirstProductName(): Promise<string> {
    const text = await this.productCards.first().locator('.product-link').textContent();
    return text?.trim() ?? '';
  }

  /** Clicks "Add to Cart" on the first product and waits for the modal */
  async addFirstProductToCart() {
    await this.productCards.first().locator('.add-to-cart-btn').click();
    await this.modalContent.waitFor({ state: 'visible' });
  }

  /** After modal opens, navigates to the cart page */
  async goToCartFromModal() {
    await this.modalViewCartLink.click();
  }
}
