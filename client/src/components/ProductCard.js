import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AddToCartModal from './AddToCartModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Add to cart clicked for:', product);
      addToCart(product, () => setShowModal(true));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <div className="product-card">
        <Link to={`/products/${product.id}`} className="product-link">
          <div className="product-image">
            <img src={product.image} alt={product.name} onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=Plant+Image';
            }} />
          </div>
          <div className="product-info">
            <div className="product-category">{product.category}</div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
          </div>
        </Link>
        <div className="product-actions">
          <span className="product-price">${product.price?.toFixed(2)}</span>
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            type="button"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
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

export default ProductCard;
