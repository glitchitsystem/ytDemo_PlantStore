import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';

test.describe('Add to cart', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));
  });

  test('shows a confirmation modal after adding a product to cart', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await expect(productsPage.modalContent).toBeVisible();
    await expect(productsPage.modalContent.locator('h3')).toHaveText('Added to Cart!');
  });

  test('modal displays the correct product name and price', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    const productName = await productsPage.getProductNameByIndex(0);
    const priceText = await productsPage.productCards.first().locator('.product-price').textContent();
    await productsPage.addFirstProductToCart();
    await expect(productsPage.modalProductName).toHaveText(productName);
    await expect(productsPage.modalProductPrice).toHaveText(priceText!.trim());
  });

  test('clicking Continue Shopping closes the modal and keeps the user on the products page', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await productsPage.modalContinueShoppingBtn.click();
    await productsPage.modalContent.waitFor({ state: 'hidden' });
    await expect(productsPage.modalContent).not.toBeVisible();
    await expect(page).toHaveURL('/products');
  });

  test('clicking the close button dismisses the modal', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await productsPage.modalCloseBtn.click();
    await productsPage.modalContent.waitFor({ state: 'hidden' });
    await expect(productsPage.modalContent).not.toBeVisible();
  });

  test('clicking View Cart navigates to the cart page with the added product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.goto();
    const productName = await productsPage.getProductNameByIndex(0);
    await productsPage.addFirstProductToCart();
    await productsPage.goToCartFromModal();
    await expect(page).toHaveURL('/cart');
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.firstItemName).toHaveText(productName);
  });

  test('adding the same product twice increments the cart quantity to two', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await productsPage.modalContinueShoppingBtn.click();
    await productsPage.modalContent.waitFor({ state: 'hidden' });
    await productsPage.addFirstProductToCart();
    await productsPage.goToCartFromModal();
    await expect(page).toHaveURL('/cart');
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.firstItemQuantityDisplay).toHaveText('2');
  });

  test('adding two different products adds both items to the cart', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await productsPage.modalContinueShoppingBtn.click();
    await productsPage.modalContent.waitFor({ state: 'hidden' });
    await productsPage.addProductToCartByIndex(1);
    await productsPage.goToCartFromModal();
    await expect(page).toHaveURL('/cart');
    await expect(cartPage.cartItems).toHaveCount(2);
  });

  test('shows a maximum stock warning in the modal when cart quantity reaches the product stock limit', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    // Seed the cart with the first product already at its stock limit so the next add triggers the warning
    await productsPage.goto();
    await page.evaluate(async () => {
      const res = await fetch('/api/products');
      const products: { id: number; name: string; price: number; stock: number; category: string; image: string; description: string }[] = await res.json();
      const first = products[0];
      localStorage.setItem('cart', JSON.stringify([{ ...first, quantity: first.stock }]));
    });
    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await expect(productsPage.modalMaxReachedMessage).toBeVisible();
    await expect(productsPage.modalMaxReachedMessage).toContainText('maximum available stock');
  });

});
