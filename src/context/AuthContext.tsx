// Authentication context
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from '../types/auth';
import { loginUser, registerUser, verifyUser } from '../api/authApi';

// Creating context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
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
        const userData = await verifyUser();
        if (userData && userData._id) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Authentication error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log("Logging in...");
      const response = await loginUser(email, password);
      
      console.log("Login response:", response);
      
      // Store token in localStorage
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        
        console.log("Token stored, verifying user...");
        try {
          const userData = await verifyUser();
          console.log("User verification result:", userData);
          
          if (userData && userData._id) {
            setUser(userData);
            console.log("User set in state, navigating to home");
            navigate('/');
          } else {
            throw new Error("Invalid user data received from verification");
          }
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
          setError("Authentication failed after login. Please try again.");
        }
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await registerUser(name, email, password);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    // Clear both cookie and localStorage
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('authToken');
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