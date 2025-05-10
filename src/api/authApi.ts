import api from './axiosConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await api.post('/api/v1/auth/login', { email, password });
    
    return res.data;
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
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token found in localStorage");
      throw new Error("No authentication token found");
    }
    
    const res = await api.get('/api/v1/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.data;
  } catch (error: any) {
    console.error('Verification error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw new Error(error.response?.data?.error || 'Authentication failed');
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // if (!token) {
    //   console.log('No token found in localStorage');
    //   return null;
    // }
    
    const response = await api.get('/api/v1/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    localStorage.removeItem('token');
    return null;
  }
};