import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        // User not found or invalid token
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, otp) => {
    try {
      const response = await authAPI.login(email, otp);
      if (response.success) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      if (error.message === 'DEVICE_CONFLICT') {
        return { success: false, deviceConflict: true, message: error.message };
      }
      return { success: false, message: error.message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
    try {
      const response = await authAPI.verifyEmail(email, otp);
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Verification failed' };
    }
  }, []);

  const requestLoginOTP = useCallback(async (email) => {
    try {
      const response = await authAPI.requestLoginOTP(email);
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to send OTP' };
    }
  }, []);

  const resendOTP = useCallback(async (email) => {
    try {
      const response = await authAPI.resendOTP(email);
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to resend OTP' };
    }
  }, []);

  const checkSubscription = useCallback(() => {
    if (!user) return false;
    
    const now = new Date();
    const endDate = new Date(user.subscriptionEndDate);
    
    if (user.subscriptionStatus === 'active' && endDate > now) {
      return true;
    }
    
    if (user.subscriptionStatus === 'trial' && endDate > now) {
      return true;
    }
    
    return false;
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    verifyEmail,
    requestLoginOTP,
    resendOTP,
    checkSubscription,
    refreshUser: checkAuth
  }), [user, loading, isAuthenticated, login, logout, register, verifyEmail, requestLoginOTP, resendOTP, checkSubscription, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

