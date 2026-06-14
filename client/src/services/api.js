import axios from 'axios';

// Base URL for all API requests - proxied to Express backend
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

// Redirect to login if a 401 response is received (token expired/invalid)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const registerUser   = (data) => API.post('/auth/register', data);
export const loginUser      = (data) => API.post('/auth/login', data);
export const getMe          = ()     => API.get('/auth/me');
export const updateMe       = (data) => API.put('/auth/me', data);

// --- Plans ---
export const getPlans           = ()     => API.get('/plans');
export const getAllPlansAdmin    = ()     => API.get('/plans/all');
export const createPlan         = (data) => API.post('/plans', data);
export const updatePlan         = (id, data) => API.put(`/plans/${id}`, data);
export const deletePlan         = (id)   => API.delete(`/plans/${id}`);

// --- Subscriptions ---
export const subscribeToPlan    = (data) => API.post('/subscriptions', data);
export const getMySubscription  = ()     => API.get('/subscriptions/me');
export const cancelSubscription = ()     => API.put('/subscriptions/cancel');
export const getAllSubscriptions = ()     => API.get('/subscriptions');

// --- Invoices ---
export const getMyInvoices       = ()   => API.get('/invoices/me');
export const getAllInvoices       = ()   => API.get('/invoices');
export const getRevenueAnalytics = ()   => API.get('/invoices/analytics');
export const downloadInvoicePdf  = (id) =>
  API.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

// --- Users (Admin) ---
export const getAllUsers    = ()          => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

export default API;
