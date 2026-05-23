import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some beautiful plants to your cart to get started!</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="cart-item-category">{item.category}</p>
              <p className="cart-item-price">${item.price?.toFixed(2)} each</p>
            </div>
            <div className="cart-item-quantity">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              className="remove-btn"
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-header">
          <h3>
            Order Summary
            <span className="cart-item-count">{getTotalItems()} items</span>
          </h3>
        </div>
        
        <div className="cart-total">
          <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
        </div>
        
        <div className="cart-actions">
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Cart
          </button>
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;