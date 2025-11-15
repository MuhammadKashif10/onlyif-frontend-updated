'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'buyer' | 'seller' | 'agent' | 'admin';
  role: 'buyer' | 'seller' | 'agent' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  sendOtp: (email?: string, phone?: string) => Promise<void>;
  verifyOtp: (email: string | undefined, phone: string | undefined, otp: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  type: 'buyer' | 'seller' | 'agent';
  phone?: string;
  brokerage?: string;
  yearsOfExperience?: number;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session validation function
  const validateSession = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, clear storage
        // localStorage.removeItem('user');
        // localStorage.removeItem('token');
        return false;
      }

      const data = await response.json();
      const userData = {
        ...data.data,
        type: data.data.role,
        role: data.data.role,
      };
      
      setUser(userData);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      // localStorage.removeItem('user');
      // localStorage.removeItem('token');
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
          // Validate session with backend
          const isValid = await validateSession();
          if (!isValid) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      const userData = {
        ...data.data.user,
        type: data.data.user.role,
        role: data.data.user.role,
      };
      
      setUser(userData);
      // Use localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
      }
    } catch (err) {
      setError('Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Admin login failed');
      }
  
      const data = await response.json();
      
      const userData = {
        ...data.data.user,
        type: data.data.user.role,
        role: data.data.user.role,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Fix: Use data.data.token instead of response.token
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
    } catch (err) {
      setError('Invalid admin credentials or unauthorized account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const requestBody: any = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        role: userData.type,
      };
  
      if (userData.phone) {
        requestBody.phone = userData.phone;
      }
  
      if (userData.type === 'agent') {
        requestBody.brokerage = userData.brokerage;
        requestBody.yearsOfExperience = userData.yearsOfExperience;
        requestBody.specialization = userData.specialization;
      }
  
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
  
      const data = await response.json();
      
      const newUser = {
        ...data.data.user,
        type: data.data.user.role,
      };
      
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', data.data.token);
      }
    } catch (err) {
      setError('Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Also clear any remaining sessionStorage items
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      // Use window.location instead of router to avoid router mounting issues
      window.location.href = '/';
    }
  };

  const sendOtp = async (email?: string, phone?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string | undefined, phone: string | undefined, otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();
      
      const userData = {
        ...data.data.user,
        type: data.data.user.role,
        role: data.data.user.role,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.data.token);
    } catch (err) {
      setError('OTP verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.type === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      adminLogin,
      logout,
      register,
      sendOtp,
      verifyOtp,
      isLoading,
      error,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}