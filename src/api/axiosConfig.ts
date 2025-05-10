import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Log for debugging
    console.log("Adding auth token to request");
    
    // If token exists, add to headers
    if (token) {
      // Make sure it's not the placeholder value
      if (token.startsWith('auth-session-')) {
        console.warn("Found placeholder token instead of JWT, authentication may fail");
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request will be sent with token:", token.substring(0, 15) + "...");
    } else {
      console.log("No token found in localStorage");
    }
    
    // Log the request URL for debugging in production
    console.log("Making " + config.method?.toUpperCase() + " request to:", config.url);
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for better error handling and debugging
api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`API Error ${error.response.status} for ${error.config?.url}:`, error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if unauthorized
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;