import { useState, useCallback } from 'react';
import apiClient from '../api/client';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient(config);
      setData(response);
     
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const get = useCallback((url, params) => 
    request({ method: 'GET', url, params }), [request]);
  
  const post = useCallback((url, data) => 
    request({ method: 'POST', url, data }), [request]);
  
  const put = useCallback((url, data) => 
    request({ method: 'PUT', url, data }), [request]);
  
  const del = useCallback((url) => 
    request({ method: 'DELETE', url }), [request]);
  
  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    request,
  };
}