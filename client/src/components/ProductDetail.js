import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import AddToCartModal from "./AddToCartModal";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    // Count total quantity for this product in the cart
    const cartItem = cartItems.find((item) => item.id === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    // If cartQuantity + 1 would exceed stock, prevent adding
    if (cartQuantity + 1 > product.stock) {
      alert("You cannot add more than the available stock for this item.");
      return;
    }
    try {
      addToCart(product, () => setShowModal(true));
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding item to cart. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-state">
          <h2>Product not found</h2>
          <p>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="back-to-products"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="product-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Products
        </button>

        <div className="product-detail">
          <div className="product-image-section">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x500?text=Plant+Image";
              }}
            />
          </div>

          <div className="product-info-section">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-price">${product.price?.toFixed(2)}</div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-stock">
              {product.stock > 0 ? (
                <span className="in-stock">
                  ✓ In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="product-actions">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="add-to-cart-button"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddToCartModal
        isOpen={showModal}
        onClose={closeModal}
        product={product}
      />
    </>
  );
};

export default ProductDetail;
