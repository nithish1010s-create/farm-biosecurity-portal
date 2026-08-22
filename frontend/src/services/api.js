// frontend/src/services/api.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',  // ← Should be 5001
});
// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ============================================
// AUTH APIS
// ============================================
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// ============================================
// FARM APIS
// ============================================
export const createFarm = (data) => API.post('/farms', data);
export const getMyFarms = () => API.get('/farms/my-farms');
export const getAllFarms = () => API.get('/farms');

// ============================================
// CHECKLIST APIS
// ============================================
export const submitChecklist = (data) => API.post('/checklists', data);
export const getChecklistHistory = (farmId) => API.get(`/checklists/farm/${farmId}`);
export const getComplianceScore = (farmId) => API.get(`/checklists/compliance/${farmId}`);

// ============================================
// ALERT APIS
// ============================================
export const createAlert = (data) => API.post('/alerts', data);
export const getAlerts = () => API.get('/alerts');

export default API;