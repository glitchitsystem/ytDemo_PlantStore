import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Use relative path - proxy will handle routing to backend
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);

      // Extract unique categories from products
      const uniqueCategories = ['All', ...new Set(data.map(product => product.category))];
      setCategories(uniqueCategories);

      if (categoryParam && uniqueCategories.includes(categoryParam)) {
        setSelectedCategory(categoryParam);
        const filtered = data.filter(product => product.category === categoryParam);
        setFilteredProducts(filtered);
      } else {
        setSelectedCategory('All');
        setFilteredProducts(data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Only run once on mount, prevents infinite loop

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading plants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Plants Collection</h1>
        <p>Discover the perfect plants for your space</p>
      </div>

      <div className="filter-section">
        <h3>Filter by Category:</h3>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found in this category.</p>
        ) : (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Products;