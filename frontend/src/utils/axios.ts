import axios from 'axios';
import { clearAuth } from './storage';

const axiosInstance = axios.create({
  // Fix: Type assertion untuk Vite env
  baseURL: (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANT: Enable cookies di request (untuk httpOnly JWT auth_token)
  withCredentials: true,
});

// Response interceptor - handle error global
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kalau token expired/invalid pada protected routes, auto logout
    // Tapi jangan redirect untuk initial auth check (getProfile call pada startup)
    if (error.response?.status === 401) {
      // Only redirect if sudah authenticated sebelumnya (ada user di localStorage)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;