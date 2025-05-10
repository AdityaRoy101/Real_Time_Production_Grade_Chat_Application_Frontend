// Authentication context
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from '../types/auth';
import { loginUser, registerUser, verifyUser } from '../api/authApi';

// Creating context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false, // Return false as default
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
        console.log("Checking authentication status...");
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("No token found in localStorage");
          setLoading(false);
          return;
        }
        
        console.log("Token found, verifying...");
        const userData = await verifyUser();
        if (userData && userData._id) {
          console.log("User verified successfully:", userData._id);
          setUser(userData);
        } else {
          console.log("Invalid user data received from verification");
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
      console.log("Attempting login for", email);
      
      // Login API call will set HTTP-only cookie
      await loginUser(email, password);
      console.log("Login successful, cookie should be set");
      
      // Generate a marker in localStorage
      localStorage.setItem('token', `auth-session-${Date.now()}`);
      
      // Verify the user to get user data using the cookie
      try {
        const userData = await verifyUser();
        console.log("User verification completed");
        
        if (userData && userData._id) {
          console.log("User verification successful, setting user:", userData._id);
          setUser(userData);
          navigate('/');
          return true; // Login successful
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
      return false; // Login failed
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