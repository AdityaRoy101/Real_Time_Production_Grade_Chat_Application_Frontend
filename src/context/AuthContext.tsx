import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from '../types/auth';
import { loginUser, registerUser, verifyUser } from '../api/authApi';

// Creating context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => {},
  logout: () => {},
  error: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        if (token.startsWith('auth-session-')) {
          console.warn("Found placeholder token instead of JWT, authentication will fail");
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        const userData = await verifyUser();
        if (userData && userData._id) {
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      
      const loginResponse = await loginUser(email, password);
      
      if (loginResponse.error) {
        setError(loginResponse.error);
        return false;
      }
      
      if (loginResponse.token) {
        localStorage.setItem('token', loginResponse.token);
      } else {
        console.error("No token received in login response");
        return false;
      }
      
      try {
        const userData = await verifyUser();
        
        if (userData && userData._id) {
          setUser(userData);
          navigate('/');
          return true;
        } else {
          console.error("Invalid user data after verification");
          throw new Error("Authentication failed after login");
        }
      } catch (verifyErr) {
        console.error("Error during verification:", verifyErr);
        throw verifyErr;
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await registerUser(name, email, password);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;