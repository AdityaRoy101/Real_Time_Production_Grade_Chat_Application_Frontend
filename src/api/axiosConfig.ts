import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Added request interceptor to include token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // console.log("No token found in localStorage");
    }
    
    
    return config;
  },
  error => Promise.reject(error)
);

// Added response interceptor for better error handling and debugging
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      console.error(`API Error ${error.response.status} for ${error.config?.url}:`, error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;