import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.role === 'admin') {
            setUser(userData);
          } else {
            await logout();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          await logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken, user: userData } = response.data;
      console.log(response.data)
      // التحقق من دور الأدمن
      if (userData.role !== 'admin') {
        throw new Error('غير مصرح بالدخول - هذا الحساب ليس أدمن ');
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      navigate('/dashboard', { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'فشل تسجيل الدخول',
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};