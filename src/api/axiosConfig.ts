import axios from 'axios';
import { API_URL } from '../config/constants';

// Create custom axios instance with absolute URLs
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token from localStorage to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase() || 'GET'} request to: ${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Enhanced error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      // Handle 401 Unauthorized by redirecting to login
      if (error.response.status === 401) {
        console.log('Unauthorized access, redirecting to login...');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Network Error - No response received:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;