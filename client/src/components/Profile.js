import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div className="orders-section">
        <h3>Order History</h3>
        {loading ? (
          <div className="loading-orders">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <h4>No orders found</h4>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="order-details">
                  <p className="order-total"><strong>Total: ${order.total_amount}</strong></p>
                  <p><strong>Status:</strong> <span className="order-status">{order.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
