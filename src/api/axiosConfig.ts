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

// Add request interceptor with better logging
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("Adding auth token to request");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No auth token available for request");
    }
    
    console.log(`Making ${config.method?.toUpperCase() || 'GET'} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add more detailed response logging
api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    // More detailed error logging
    if (error.response) {
      console.error(`API Error ${error.response.status} for ${error.config?.url}:`, error.response.data);
      if (error.response.status === 401) {
        console.log('Unauthorized access, clearing token and redirecting to login...');
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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