// components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Veggie Market</Link>
      </div>
      <div className="navbar-menu">
        
        {user ? (
          <>
            <Link to="/" className="navbar-item">Home</Link>
            <Link to="/cart" className="navbar-item">
              Cart ({cartItems.length})
            </Link>
            <Link to="/orders" className="navbar-item">Orders</Link>
            <button onClick={handleLogout} className="navbar-item logout-btn">Logout</button>
            <span className="navbar-item user-info">
              {user.username} ({user.role})
            </span>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">Login</Link>
            <Link to="/register" className="navbar-item">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;