import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./AddToCartModal.css";

const AddToCartModal = ({ isOpen, onClose, product }) => {
  const { cartItems } = useCart();

  if (!isOpen || !product) return null;

  // Find current quantity in cart for this product
  const cartItem = cartItems.find((item) => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const maxReached = cartQuantity >= product.stock;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <div className="success-icon">✓</div>
          <h3>Added to Cart!</h3>
        </div>

        <div className="modal-body">
          <div className="product-info">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <div className="product-details">
              <h4>{product.name}</h4>
              <p className="product-category">{product.category}</p>
              <p className="product-price">${product.price?.toFixed(2)}</p>
              {maxReached && (
                <div className="field-error">
                  You have added the maximum available stock for this item.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="continue-shopping">
            Continue Shopping
          </button>
          <Link to="/cart" className="view-cart" onClick={onClose}>
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
