import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get('https://grocery-app-vktw.onrender.com/api/auth/current-user', {
          withCredentials: true
        });
        
        if (res.data.user) {
          setUser(res.data.user);
          // Also fetch cart if user is logged in
          fetchCart();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch user's cart
  const fetchCart = async () => {
    try {
      const res = await axios.get('https://grocery-app-vktw.onrender.com/api/cart', {
        withCredentials: true
      });
      setCart(res.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        'https://grocery-app-vktw.onrender.com/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      
      setUser(res.data.user);
      await fetchCart(); // Get cart after login
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(
        'https://grocery-app-vktw.onrender.com/api/auth/register',
        { name, email, password },
        { withCredentials: true }
      );
      
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        'https://grocery-app-vktw.onrender.com/api/auth/logout',
        {},
        { withCredentials: true }
      );
      
      setUser(null);
      setCart({ items: [] });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update cart state
  const updateCart = (newCart) => {
    setCart(newCart);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    cart,
    updateCart,
    fetchCart
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;