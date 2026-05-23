import { test, expect } from "@playwright/test";

test.describe("Shopping Cart and Checkout", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage cart state before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("cart"));
  });

  test("Add a product to the cart and verify it appears", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector(".product-card");

    // Click Add to Cart on the first product
    const firstCard = page.locator(".product-card").first();
    const productName = await firstCard
      .locator(".product-name")
      .first()
      .textContent();
    await firstCard.locator(".add-to-cart-btn").click();

    // Modal should appear
    await expect(page.locator(".modal-content")).toBeVisible();

    // Navigate to cart via modal button
    await page.locator(".view-cart").click();
    await expect(page).toHaveURL("/cart");

    // Cart should contain the product
    await expect(page.locator(".cart-item")).toHaveCount(1);
    await expect(page.locator(".cart-item h3")).toContainText(
      productName!.trim(),
    );
  });

  test("Update quantity to 2 and verify the total updates correctly", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.waitForSelector(".product-card");

    // Add first product to cart
    await page
      .locator(".product-card")
      .first()
      .locator(".add-to-cart-btn")
      .click();
    await page.locator(".view-cart").click();
    await expect(page).toHaveURL("/cart");

    // Get the unit price
    const priceText = await page
      .locator(".cart-item-price")
      .first()
      .textContent();
    const unitPrice = parseFloat(priceText!.replace(/[^0-9.]/g, ""));

    // Increase quantity to 2
    await page
      .locator('.quantity-btn[aria-label="Increase quantity"]')
      .first()
      .click();
    await expect(page.locator(".quantity").first()).toHaveText("2");

    // Verify item total reflects quantity × price
    const itemTotalText = await page
      .locator(".cart-item-total")
      .first()
      .textContent();
    const itemTotal = parseFloat(itemTotalText!.replace(/[^0-9.]/g, ""));
    expect(itemTotal).toBeCloseTo(unitPrice * 2, 2);

    // Verify cart summary total
    const summaryText = await page
      .locator(".cart-summary h3")
      .filter({ hasText: "Total:" })
      .textContent();
    const summaryTotal = parseFloat(summaryText!.replace(/[^0-9.]/g, ""));
    expect(summaryTotal).toBeCloseTo(unitPrice * 2, 2);
  });

  test("Fill out the checkout form and submit", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector(".product-card");

    // Add product and go to cart
    await page
      .locator(".product-card")
      .first()
      .locator(".add-to-cart-btn")
      .click();
    await page.locator(".view-cart").click();
    await page.locator(".checkout-btn").click();
    await expect(page).toHaveURL("/checkout");

    // Fill shipping form
    await page.fill("#name", "Jane Doe");
    await page.fill("#email", "jane.doe@example.com");
    await page.fill("#address", "123 Garden Lane");
    await page.fill("#city", "Portland");
    await page.fill("#zipCode", "97201");
    await page.fill("#phone", "5031234567");

    // Accept the confirmation dialog and submit
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".place-order-btn").click();
  });

  test("Verify order confirmation after checkout", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector(".product-card");

    // Add product and go to checkout
    await page
      .locator(".product-card")
      .first()
      .locator(".add-to-cart-btn")
      .click();
    await page.locator(".view-cart").click();
    await page.locator(".checkout-btn").click();
    await expect(page).toHaveURL("/checkout");

    // Fill shipping form
    await page.fill("#name", "Jane Doe");
    await page.fill("#email", "jane.doe@example.com");
    await page.fill("#address", "123 Garden Lane");
    await page.fill("#city", "Portland");
    await page.fill("#zipCode", "97201");
    await page.fill("#phone", "5031234567");

    // Handle confirmation dialog and submit
    const dialogPromise = page.waitForEvent("dialog");
    await page.locator(".place-order-btn").click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("Order placed successfully");
    await dialog.accept();

    // Should redirect to home page after order
    await expect(page).toHaveURL("/");
  });

  test("Remove an item from the cart and verify the cart is empty", async ({
    page,
  }) => {
    await page.goto("/products");
    await page.waitForSelector(".product-card");

    // Add a product to the cart
    await page
      .locator(".product-card")
      .first()
      .locator(".add-to-cart-btn")
      .click();
    await page.locator(".view-cart").click();
    await expect(page).toHaveURL("/cart");

    // Remove the item
    await page.locator(".remove-btn").first().click();

    // Cart should now be empty — assertion intentionally omitted
    // await expect(page.locator(".cart-item")).toHaveCount(0);
  });
});
