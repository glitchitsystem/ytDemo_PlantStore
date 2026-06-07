import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/CartContext');
jest.mock('../context/AuthContext');

const mockLogout = jest.fn();

const defaultCart = { cartItems: [], getTotalItems: () => 0 };
const defaultAuth = { user: null, logout: mockLogout };

const renderHeader = (path = '/', authOverrides = {}, cartOverrides = {}) => {
  useCart.mockReturnValue({ ...defaultCart, ...cartOverrides });
  useAuth.mockReturnValue({ ...defaultAuth, ...authOverrides });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );
};

beforeEach(() => {
  mockLogout.mockClear();
});

describe('Header', () => {
  it('renders the brand logo', () => {
    renderHeader();
    expect(screen.getByText(/PlantShop/i)).toBeInTheDocument();
  });

  it('renders Home, Products and Cart navigation links', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cart/i })).toBeInTheDocument();
  });

  it('shows Login link when no user is logged in', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows Register link when on the /login page', () => {
    renderHeader('/login');
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  it('displays the cart item count', () => {
    renderHeader('/', {}, { cartItems: [{ id: 1, quantity: 3 }], getTotalItems: () => 3 });
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('shows Profile and Logout when user is logged in', () => {
    renderHeader('/', { user: { id: 1, firstName: 'Alice' } });
    expect(screen.getByRole('link', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('does not show Login when user is logged in', () => {
    renderHeader('/', { user: { id: 1, firstName: 'Alice' } });
    expect(screen.queryByRole('link', { name: /Login/i })).not.toBeInTheDocument();
  });

  it('calls logout when the Logout button is clicked', () => {
    renderHeader('/', { user: { id: 1, firstName: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
