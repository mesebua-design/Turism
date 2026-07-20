// Central API client for the TourGuide.ge backend.
// Set REACT_APP_API_URL in your frontend .env (or Vercel env vars) to your
// live backend URL, e.g. https://tourguide-backend.onrender.com/api
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token (if logged in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const guidesAPI = {
  getAll: (params) => api.get('/guides', { params }),
  getById: (id) => api.get(`/guides/${id}`),
  update: (id, data) => api.put(`/guides/${id}`, data),
  uploadPhotos: (id, formData) =>
    api.post(`/guides/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const toursAPI = {
  create: (data) => api.post('/tours', data),
  getById: (id) => api.get(`/tours/${id}`),
  update: (id, data) => api.put(`/tours/${id}`, data),
  remove: (id) => api.delete(`/tours/${id}`),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getForTourist: (touristId) => api.get(`/bookings/tourist/${touristId}`),
  getForGuide: (guideId) => api.get(`/bookings/guide/${guideId}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getForGuide: (guideId) => api.get(`/reviews/guide/${guideId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export default api;
