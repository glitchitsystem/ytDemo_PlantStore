import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>GreenThumb Garden</h3>
            <p>Your trusted source for beautiful, healthy plants and garden accessories.</p>
            <div className="social-links">
              <span>Follow us:</span>
              <button type="button" aria-label="Facebook">📘</button>
              <button type="button" aria-label="Instagram">📷</button>
              <button type="button" aria-label="Twitter">🐦</button>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/cart">Cart</a></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><a href="/products?category=Indoor Plants">Indoor Plants</a></li>
              <li><a href="/products?category=Herbs">Herbs</a></li>
              <li><a href="/products?category=Succulents">Succulents</a></li>
              <li><a href="/products?category=Accessories">Accessories</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/care">Plant Care Guide</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} GreenThumb Garden. All rights reserved.</p>
          <p>Images sourced from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;