import axios from 'axios';

// Get API URL from runtime config
const API_URL = window.ENV?.REACT_APP_API_URL || '/api';

// Create axios instance with common config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API services
export const restaurantService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/restaurants', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  },
  
  getMenu: async (restaurantId) => {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  }
};

export const orderService = {
  getAll: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },
  
  trackOrder: async (orderId) => {
    const response = await apiClient.get(`/delivery/tracking/${orderId}`);
    return response.data;
  }
};

export const userService = {
  register: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.patch('/users/profile', userData);
    return response.data;
  }
};

export default {
  restaurant: restaurantService,
  order: orderService,
  user: userService
};


