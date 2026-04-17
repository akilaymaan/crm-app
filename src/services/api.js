import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cliento_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cliento_token');
      localStorage.removeItem('cliento_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ───────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateDetails: (data) => API.put('/auth/me', data),
};

// ─── CONTACTS ───────────────────────────────────────
export const contactsAPI = {
  getAll: (params) => API.get('/contacts', { params }),
  create: (data) => API.post('/contacts', data),
  update: (id, data) => API.put(`/contacts/${id}`, data),
  delete: (id) => API.delete(`/contacts/${id}`),
  addHistory: (id, data) => API.post(`/contacts/${id}/history`, data),
};

// ─── DEALS ──────────────────────────────────────────
export const dealsAPI = {
  getAll: (params) => API.get('/deals', { params }),
  getStats: () => API.get('/deals/stats'),
  create: (data) => API.post('/deals', data),
  update: (id, data) => API.put(`/deals/${id}`, data),
  delete: (id) => API.delete(`/deals/${id}`),
};

// ─── TASKS ──────────────────────────────────────────
export const tasksAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getStats: () => API.get('/tasks/stats'),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
};

// ─── AI CHAT ────────────────────────────────────────
export const aiAPI = {
  chat: (message, history = []) => API.post('/ai/chat', { message, history }),
  confirm: (intent) => API.post('/ai/confirm', { intent }),
};

// ─── USERS (Admin Only) ───────────────────────────
export const usersAPI = {
  getAll: () => API.get('/users'),
  updateRole: (id, role) => API.patch(`/users/${id}/role`, { role }),
};

export default API;

