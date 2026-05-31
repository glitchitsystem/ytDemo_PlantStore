import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly firstItemName: Locator;
  readonly firstItemPrice: Locator;
  readonly firstItemTotal: Locator;
  readonly firstItemQuantityDisplay: Locator;
  readonly firstIncreaseQtyBtn: Locator;
  readonly firstDecreaseQtyBtn: Locator;
  readonly summaryTotal: Locator;
  readonly checkoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart-item');
    this.firstItemName = page.locator('.cart-item h3').first();
    this.firstItemPrice = page.locator('.cart-item-price').first();
    this.firstItemTotal = page.locator('.cart-item-total').first();
    this.firstItemQuantityDisplay = page.locator('.cart-item-quantity .quantity').first();
    this.firstIncreaseQtyBtn = page.locator('.quantity-btn[aria-label="Increase quantity"]').first();
    this.firstDecreaseQtyBtn = page.locator('.quantity-btn[aria-label="Decrease quantity"]').first();
    this.summaryTotal = page.locator('.cart-summary h3').filter({ hasText: 'Total:' });
    this.checkoutBtn = page.locator('.checkout-btn');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  /** Parses a price string like "$29.99" or "Total: $29.99" and returns the number */
  parsePrice(text: string): number {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  async getUnitPrice(): Promise<number> {
    const text = await this.firstItemPrice.textContent() ?? '';
    return this.parsePrice(text);
  }

  async getItemTotal(): Promise<number> {
    const text = await this.firstItemTotal.textContent() ?? '';
    return this.parsePrice(text);
  }

  async getSummaryTotal(): Promise<number> {
    const text = await this.summaryTotal.textContent() ?? '';
    return this.parsePrice(text);
  }

  async increaseQuantity() {
    await this.firstIncreaseQtyBtn.click();
  }

  async proceedToCheckout() {
    await this.checkoutBtn.click();
    await this.page.waitForURL('/checkout');
  }
}
