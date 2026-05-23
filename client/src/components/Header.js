import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { cartItems, getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getAuthLink = () => {
    if (location.pathname === "/login") {
      return (
        <Link to="/register" className="nav-link">
          Register
        </Link>
      );
    } else {
      return (
        <Link to="/login" className="nav-link">
          Login
        </Link>
      );
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          🌱 PlantShop
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-icon">🛍️</span>
            <span className="cart-text">Cart</span>
            <span className="cart-count">({getTotalItems()})</span>
          </Link>
          {user ? (
            <div className="auth-links">
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">{getAuthLink()}</div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
