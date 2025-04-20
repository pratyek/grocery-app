
// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get('https://grocery-app-vktw.onrender.com/api/user', { withCredentials: true ,   headers: {
          'Content-Type': 'application/json'
        }
       });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Register user
  
  const register = async (userData) => {
    try {
      console.log(userData);
      const res = await axios.post('https://grocery-app-vktw.onrender.com/api/register', userData, { withCredentials: true ,   headers: {
        'Content-Type': 'application/json'
      }
    });
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('https://grocery-app-vktw.onrender.com/api/login', userData, { withCredentials: true ,   headers: {
        'Content-Type': 'application/json'
      }
     });
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('https://grocery-app-vktw.onrender.com/api/logout', {}, { withCredentials: true ,   headers: {
        'Content-Type': 'application/json'
      }
     });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};