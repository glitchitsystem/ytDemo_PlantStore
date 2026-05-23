import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Inline validation logic
  const validate = (field, value) => {
    let message = '';
    if (field === 'name') {
      if (!value.trim()) message = 'Name is required';
      else if (value.length < 2) message = 'Name must be at least 2 characters';
    }
    if (field === 'email') {
      if (!value.trim()) message = 'Email is required';
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) message = 'Invalid email address';
    }
    if (field === 'password') {
      if (!value) message = 'Password is required';
      else if (value.length < 6) message = 'Password must be at least 6 characters';
    }
    if (field === 'confirmPassword') {
      if (value !== formData.password) message = 'Passwords do not match';
    }
    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: validate(name, value)
    });
    if (name === 'password' || name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validate('confirmPassword', name === 'confirmPassword' ? value : formData.confirmPassword)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields before submit
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const msg = validate(field, formData[field]);
      if (msg) newErrors[field] = msg;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
