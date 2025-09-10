import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://chathubbackend-production.up.railway.app/admin';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token dynamically from localStorage for each request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global response handler: on 401, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error?.response?.status;
      if (status === 401) {
        try {
          localStorage.removeItem('adminToken');
        } catch {}
        // redirect to login page
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
