// tests/api/orders.spec.ts
import { test, expect } from '@playwright/test';

// --- Types ---
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  name: string;
  email: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
}

interface OrderPayload {
  items: OrderItem[];
  total: number;
  shipping: ShippingInfo;
}

interface OrderResponse {
  id: number;
  orderId: number;
  message: string;
}

interface StockErrorResponse {
  errors: string[];
  adjustedItems: OrderItem[];
}

interface ErrorResponse {
  error: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// --- Factories ---
function buildOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 1,
    name: 'Snake Plant',
    price: 29.99,
    quantity: 1,
    ...overrides,
  };
}

function buildShipping(overrides: Partial<ShippingInfo> = {}): ShippingInfo {
  return {
    name: 'Test User',
    email: 'test_orders@example.com',
    address: '123 Garden Lane',
    city: 'Portland',
    zipCode: '97201',
    phone: '5031234567',
    ...overrides,
  };
}

function buildOrderPayload(overrides: Partial<OrderPayload> = {}): OrderPayload {
  return {
    items: [buildOrderItem()],
    total: 29.99,
    shipping: buildShipping(),
    ...overrides,
  };
}

// --- Helpers ---
const API_BASE = 'http://localhost:5001/api';

test.describe('POST /api/orders', () => {
  let testProduct: Product;
  let secondProduct: Product;

  test.beforeAll(async ({ request }) => {
    const res = await request.get(`${API_BASE}/products`);
    const products: Product[] = await res.json();
    // Prefer the product with highest stock to minimize depletion risk across runs
    const sorted = [...products].sort((a, b) => b.stock - a.stock);
    testProduct = sorted[0];
    secondProduct = sorted[1];
  });

  test.describe('happy path', () => {
    test('places an order and returns id, orderId, and success message', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 1 })],
        total: testProduct.price,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(200);
      const body: OrderResponse = await response.json();
      expect(typeof body.id).toBe('number');
      expect(typeof body.orderId).toBe('number');
      expect(body.id).toBe(body.orderId);
      expect(body.message).toBe('Order placed successfully');
    });

    test('places a multi-item order and returns a valid orderId', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [
          buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 1 }),
          buildOrderItem({ id: secondProduct.id, name: secondProduct.name, price: secondProduct.price, quantity: 1 }),
        ],
        total: testProduct.price + secondProduct.price,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(200);
      const body: OrderResponse = await response.json();
      expect(typeof body.orderId).toBe('number');
      expect(body.message).toBe('Order placed successfully');
    });

    test('accepts an order when only required shipping fields (name and email) are provided', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 1 })],
        total: testProduct.price,
        shipping: { name: 'Minimal User', email: 'test_minimal@example.com' },
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(200);
      const body: OrderResponse = await response.json();
      expect(body).toHaveProperty('orderId');
      expect(body.message).toBe('Order placed successfully');
    });

    test('each successful order receives a unique incrementing orderId', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 1 })],
        total: testProduct.price,
      });

      const firstResponse = await request.post(`${API_BASE}/orders`, { data: payload });
      const secondResponse = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(firstResponse.status()).toBe(200);
      expect(secondResponse.status()).toBe(200);

      const firstBody: OrderResponse = await firstResponse.json();
      const secondBody: OrderResponse = await secondResponse.json();
      expect(secondBody.orderId).toBeGreaterThan(firstBody.orderId);
    });
  });

  test.describe('validation errors', () => {
    test('returns 400 when items is missing from the request body', async ({ request }) => {
      const { items: _items, ...withoutItems } = buildOrderPayload() as any;

      const response = await request.post(`${API_BASE}/orders`, { data: withoutItems });

      expect(response.status()).toBe(400);
      const body: ErrorResponse = await response.json();
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
    });

    test('returns 400 when total is missing from the request body', async ({ request }) => {
      const { total: _total, ...withoutTotal } = buildOrderPayload() as any;

      const response = await request.post(`${API_BASE}/orders`, { data: withoutTotal });

      expect(response.status()).toBe(400);
      const body: ErrorResponse = await response.json();
      expect(body).toHaveProperty('error');
    });

    test('returns 400 when shipping name is missing', async ({ request }) => {
      const payload = buildOrderPayload({
        shipping: { email: 'test_noname@example.com' } as ShippingInfo,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: ErrorResponse = await response.json();
      expect(body).toHaveProperty('error');
    });

    test('returns 400 when shipping email is missing', async ({ request }) => {
      const payload = buildOrderPayload({
        shipping: { name: 'No Email User' } as ShippingInfo,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: ErrorResponse = await response.json();
      expect(body).toHaveProperty('error');
    });
  });

  test.describe('edge cases', () => {
    test('returns 400 with errors and adjustedItems when quantity exceeds available stock', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 })],
        total: testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors.length).toBeGreaterThan(0);
      expect(Array.isArray(body.adjustedItems)).toBe(true);
    });

    test('adjustedItems reflects the item with quantity capped to available stock', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 })],
        total: testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      expect(body.adjustedItems).toHaveLength(1);
      expect(body.adjustedItems[0].id).toBe(testProduct.id);
      expect(body.adjustedItems[0].quantity).toBeLessThan(9999);
    });

    test('error message mentions the product name when stock is insufficient', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 })],
        total: testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      expect(body.errors[0]).toContain(testProduct.name);
    });

    test('does not return an orderId when stock validation fails', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 })],
        total: testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).not.toHaveProperty('orderId');
      expect(body).not.toHaveProperty('id');
    });

    test('returns 400 with a product-not-found error when an item id does not exist', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [buildOrderItem({ id: 99999, name: 'Nonexistent Plant', quantity: 1 })],
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors[0]).toContain('99999');
    });

    test('returns 400 when one item in a multi-item order exceeds stock', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [
          buildOrderItem({ id: secondProduct.id, name: secondProduct.name, price: secondProduct.price, quantity: 1 }),
          buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 }),
        ],
        total: secondProduct.price + testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      expect(body.errors.length).toBe(1);
      expect(body.adjustedItems).toHaveLength(2);
    });

    test('adjustedItems preserves the valid item unchanged in a mixed-stock order', async ({ request }) => {
      const payload = buildOrderPayload({
        items: [
          buildOrderItem({ id: secondProduct.id, name: secondProduct.name, price: secondProduct.price, quantity: 1 }),
          buildOrderItem({ id: testProduct.id, name: testProduct.name, price: testProduct.price, quantity: 9999 }),
        ],
        total: secondProduct.price + testProduct.price * 9999,
      });

      const response = await request.post(`${API_BASE}/orders`, { data: payload });

      expect(response.status()).toBe(400);
      const body: StockErrorResponse = await response.json();
      const validItem = body.adjustedItems.find(i => i.id === secondProduct.id);
      expect(validItem).toBeDefined();
      expect(validItem!.quantity).toBe(1);
    });
  });
});
