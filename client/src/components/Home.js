import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const featuredCategories = [
    {
      name: 'Indoor Plants',
      description: 'Beautiful houseplants to brighten your home',
      emoji: '🪴',
      category: 'Indoor Plants'
    },
    {
      name: 'Herbs',
      description: 'Fresh herbs for your kitchen garden',
      emoji: '🌿',
      category: 'Herbs'
    },
    {
      name: 'Succulents',
      description: 'Low-maintenance plants perfect for beginners',
      emoji: '🌵',
      category: 'Succulents'
    },
    {
      name: 'Accessories',
      description: 'Everything you need for plant care',
      emoji: '🪣',
      category: 'Accessories'
    },
    {
      name: 'Outdoor',
      description: 'Hardy plants for your outdoor garden and patio',
      emoji: '🌳',
      category: 'Outdoor'
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to GreenThumb Garden
          </h1>
          <p className="hero-subtitle">
            Discover the perfect plants to transform your space into a green oasis
          </p>
          <Link to="/products" className="cta-button">
            Shop Plants Now
          </Link>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&crop=center" 
            alt="Beautiful garden"
          />
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose GreenThumb Garden?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🌱</div>
              <h3>Premium Quality</h3>
              <p>Hand-selected, healthy plants from trusted growers</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Safe packaging and quick delivery to your doorstep</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💚</div>
              <h3>Expert Care Tips</h3>
              <p>Detailed care instructions with every plant</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {featuredCategories.map((category, index) => (
              <Link 
                key={index} 
                to={`/products?category=${encodeURIComponent(category.category)}`} 
                className="category-card"
              >
                <div className="category-emoji">{category.emoji}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial">
        <div className="container">
          <blockquote className="testimonial-quote">
            "GreenThumb Garden helped me transform my apartment into a lush, green sanctuary. 
            The plants are always healthy and the care instructions are so helpful!"
          </blockquote>
          <cite className="testimonial-author">- Sarah M., Happy Customer</cite>
        </div>
      </section>
    </div>
  );
};

export default Home;