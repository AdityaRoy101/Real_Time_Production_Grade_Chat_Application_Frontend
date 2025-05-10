// Authentication API calls
import api from './axiosConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Making login API call...");
    const res = await api.post('/api/v1/auth/login', { email, password });
    console.log("Login API response:", res.data);
    
    // Extract token from Authorization header if available
    const authHeader = res.headers?.authorization || res.headers?.Authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("Token extracted from response headers");
    }
    
    return {
      ...res.data,
      token // Add token to the response if found in headers
    };
  } catch (error: any) {
    console.error('Login API error:', error);
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const res = await api.post('/api/v1/auth/signup', { name, email, password });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const verifyUser = async () => {
  try {
    console.log("Verifying user authentication...");
    const res = await api.get('/api/v1/auth/verify');
    console.log("Verification result:", res.data);
    
    // Extract token from Authorization header if available
    const authHeader = res.headers?.authorization || res.headers?.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return {
        ...res.data,
        token // Add token to user data if found in headers
      };
    }
    
    return res.data;
  } catch (error: any) {
    console.error('Verification error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken'); // Clear invalid token
    }
    throw new Error(error.response?.data?.error || 'Authentication failed');
  }
};