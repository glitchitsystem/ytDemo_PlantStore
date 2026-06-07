import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

jest.mock('../context/CartContext');
jest.mock('./AddToCartModal', () => () => null);

const mockAddToCart = jest.fn();

const product = {
  id: 1,
  name: 'Peace Lily',
  price: 19.99,
  description: 'A beautiful indoor plant',
  category: 'Indoor',
  image: 'lily.jpg',
  stock: 5,
};

const renderCard = (p = product) => {
  useCart.mockReturnValue({ addToCart: mockAddToCart });
  return render(
    <MemoryRouter>
      <ProductCard product={p} />
    </MemoryRouter>
  );
};

beforeEach(() => {
  mockAddToCart.mockClear();
});

describe('ProductCard', () => {
  it('renders the product name', () => {
    renderCard();
    expect(screen.getByText('Peace Lily')).toBeInTheDocument();
  });

  it('renders the product price formatted to two decimals', () => {
    renderCard();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('renders the product category', () => {
    renderCard();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders the product description', () => {
    renderCard();
    expect(screen.getByText('A beautiful indoor plant')).toBeInTheDocument();
  });

  it('shows an enabled Add to Cart button when in stock', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: /Add to Cart/i });
    expect(btn).toBeEnabled();
  });

  it('shows a disabled Out of Stock button when stock is 0', () => {
    renderCard({ ...product, stock: 0 });
    const btn = screen.getByRole('button', { name: /Out of Stock/i });
    expect(btn).toBeDisabled();
  });

  it('calls addToCart with the product when the button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(product, expect.any(Function));
  });

  it('does not call addToCart when the product is out of stock', () => {
    renderCard({ ...product, stock: 0 });
    fireEvent.click(screen.getByRole('button', { name: /Out of Stock/i }));
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('renders a fallback message when product is null', () => {
    useCart.mockReturnValue({ addToCart: mockAddToCart });
    render(
      <MemoryRouter>
        <ProductCard product={null} />
      </MemoryRouter>
    );
    expect(screen.getByText('Product not found')).toBeInTheDocument();
  });
});
