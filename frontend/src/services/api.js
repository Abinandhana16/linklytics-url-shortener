const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// URL Service Endpoints
export const urlService = {
  shorten: async (urlData) => {
    const response = await api.post('/url/shorten', urlData);
    return response.data;
  },
  getMyLinks: async () => {
    const response = await api.get('/url/my-links');
    return response.data;
  },
  updateUrl: async (id, originalUrl) => {
    const response = await api.put(`/url/${id}`, { originalUrl });
    return response.data;
  },
  deleteUrl: async (id) => {
    const response = await api.delete(`/url/${id}`);
    return response.data;
  },
  bulkShorten: async (bulkData) => {
    const response = await api.post('/url/bulk-shorten', bulkData);
    return response.data;
  },
};

// Analytics Service Endpoints
export const analyticsService = {
  getAnalytics: async (id) => {
    const response = await api.get(`/analytics/${id}`);
    return response.data;
  },
};

export default api;
