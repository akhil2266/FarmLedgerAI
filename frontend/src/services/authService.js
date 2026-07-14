import { api } from './apiClient';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getProfile: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((r) => r.data),
  changePassword: (payload) => api.post('/auth/change-password', payload).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((r) => r.data),
};
