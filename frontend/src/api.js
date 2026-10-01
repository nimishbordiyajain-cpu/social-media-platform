// Axios instance: every request goes to the backend API base URL from .env
import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({ baseURL });

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
export const errorMessage = (err) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  err.message ||
  'Something went wrong';

export default api;
