// client.js - أضف هذا التعديل

import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    // ❌ لا نضع Content-Type هنا لأن axios سيضبطه تلقائياً
    // 'Content-Type': 'application/json', // أزل هذا السطر
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ إذا كانت البيانات FormData، اترك axios يضبط Content-Type تلقائياً
    // لا نضيف Content-Type يدوياً لأن axios سيضيفه مع الـ boundary
    if (config.data instanceof FormData) {
      // لا تفعل شيئاً - axios سيضبط multipart/form-data تلقائياً
      console.log('📤 Sending FormData with image');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// باقي الكود كما هو...
// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        localStorage.setItem('accessToken', response.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        return Promise.reject(refreshError);
      }
    }
    
    const errorMessage = error.response?.data?.message || 'حدث خطأ غير متوقع';
    
    if (error.response?.status === 403) {
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
    } else if (error.response?.status === 404) {
      toast.error('المورد غير موجود');
    } else if (error.response?.status === 429) {
      toast.error('طلبات كثيرة جداً، الرجاء المحاولة لاحقاً');
    } else if (error.response?.status >= 500) {
      toast.error('خطأ في الخادم، الرجاء المحاولة لاحقاً');
    } else {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;