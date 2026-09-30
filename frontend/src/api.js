// Axios instance: every request goes to the backend API base URL from .env
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Request interceptor: automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: if the server rejects the token, clear the login and go to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Helper to read the error message sent by the backend
export const errorMessage = (err) => err.response?.data?.message || 'Something went wrong';

export default api;
