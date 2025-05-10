// Authentication API calls
import api from './axiosConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await api.post('/api/v1/auth/login', { email, password });
    return res.data;
  } catch (error: any) {
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
    const res = await api.get('/api/v1/auth/verify');
    return res.data;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};