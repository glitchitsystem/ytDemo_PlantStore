import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const product1 = { id: 1, name: 'Peace Lily', price: 19.99 };
const product2 = { id: 2, name: 'Cactus', price: 9.99 };

beforeEach(() => {
  localStorage.clear();
});

describe('CartContext - initial state', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  it('throws when used outside CartProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(
      'useCart must be used within a CartProvider'
    );
    consoleSpy.mockRestore();
  });
});

describe('CartContext - addToCart', () => {
  it('adds a new product with quantity 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toMatchObject({ ...product1, quantity: 1 });
  });

  it('increments quantity when the same product is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
      result.current.addToCart(product1);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('adds multiple distinct products', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
      result.current.addToCart(product2);
    });

    expect(result.current.cartItems).toHaveLength(2);
  });

  it('invokes the onSuccess callback after adding', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const onSuccess = jest.fn();

    act(() => {
      result.current.addToCart(product1, onSuccess);
    });

    expect(onSuccess).toHaveBeenCalledWith(product1);
  });
});

describe('CartContext - removeFromCart', () => {
  it('removes the correct product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
      result.current.addToCart(product2);
    });
    act(() => {
      result.current.removeFromCart(product1.id);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].id).toBe(product2.id);
  });

  it('leaves an empty cart after removing the last item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });
    act(() => {
      result.current.removeFromCart(product1.id);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });
});

describe('CartContext - updateQuantity', () => {
  it('updates the quantity of a product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });
    act(() => {
      result.current.updateQuantity(product1.id, 5);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
  });

  it('removes the product when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });
    act(() => {
      result.current.updateQuantity(product1.id, 0);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('removes the product when quantity is set to a negative number', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });
    act(() => {
      result.current.updateQuantity(product1.id, -1);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });
});

describe('CartContext - clearCart', () => {
  it('removes all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
      result.current.addToCart(product2);
    });
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
  });
});

describe('CartContext - totals', () => {
  it('calculates the total price correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1); // 19.99 x1
      result.current.addToCart(product2); // 9.99 x1
      result.current.addToCart(product2); // 9.99 x2
    });

    // product1: 19.99, product2: 9.99 * 2 = 19.98 → total 39.97
    expect(result.current.getTotalPrice()).toBeCloseTo(39.97);
  });

  it('calculates the total item count correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
      result.current.addToCart(product1);
      result.current.addToCart(product2);
    });

    expect(result.current.getTotalItems()).toBe(3);
  });
});

describe('CartContext - localStorage', () => {
  it('persists cart items to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product1);
    });

    const stored = JSON.parse(localStorage.getItem('cart'));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(product1.id);
  });
});
