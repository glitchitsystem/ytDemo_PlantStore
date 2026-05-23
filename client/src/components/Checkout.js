import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { cartItems = [], getTotalPrice, clearCart, updateCartQuantities } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  // Redirect if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out.</p>
          <button onClick={() => navigate('/products')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages([]);

    try {
      const orderData = {
        items: cartItems,
        total: getTotalPrice(),
        shipping: formData
      };

      console.log('Submitting order:', orderData);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();
      console.log('Order response:', responseData);

      if (!response.ok && responseData.adjustedItems) {
        updateCartQuantities(responseData.adjustedItems);
        setErrorMessages(responseData.errors || [responseData.error]);
        setLoading(false);
        return;
      }

      if (response.ok) {
        clearCart();
        alert('Order placed successfully! Order ID: ' + responseData.orderId);
        navigate('/');
      } else {
        setErrorMessages(responseData.errors || [responseData.error]);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setErrorMessages(['An error occurred. Please try again.']);
    }

    setLoading(false);
  };

  const total = getTotalPrice ? getTotalPrice() : 0;

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} className="order-item-image" />
                <div className="order-item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: ${total.toFixed(2)}</h3>
          </div>
        </div>

        <div className="checkout-form">
          <h3>Shipping Information</h3>
          {errorMessages.length > 0 && (
            <div className="checkout-error-message">
              {errorMessages.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code:</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;