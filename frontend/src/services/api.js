import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT/admin auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saree_admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public Product APIs
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);

// Public Enquiry API
export const submitEnquiry = (enquiryData) => api.post('/enquiries', enquiryData);

// Admin Auth API
export const adminLogin = (credentials) => api.post('/admin/login', credentials);

// Admin Products API
export const adminGetProducts = () => api.get('/admin/products');
export const adminCreateProduct = (productData) => api.post('/admin/products', productData);
export const adminUpdateProduct = (id, productData) => api.put(`/admin/products/${id}`, productData);
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);

// Admin Enquiries API
export const adminGetEnquiries = () => api.get('/admin/enquiries');
export const adminGetEnquiryById = (id) => api.get(`/admin/enquiries/${id}`);
export const adminUpdateEnquiryStatus = (id, status) => api.put(`/admin/enquiries/${id}/status`, { status });

// Admin Dashboard Stats API
export const adminGetDashboardStats = () => api.get('/admin/stats');

export default api;
