import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success) {
          setUser(response.data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Email already registered or invalid input',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
