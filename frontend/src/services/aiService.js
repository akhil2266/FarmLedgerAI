import { api } from './apiClient';

export const aiService = {
  cropRecommendation: (payload) => api.post('/ai/crop-recommendation', payload).then((r) => r.data),
  cropRecommendationHistory: () => api.get('/ai/crop-recommendation/history').then((r) => r.data),

  profitPrediction: (payload) => api.post('/ai/profit-prediction', payload).then((r) => r.data),
  profitPredictionHistory: () => api.get('/ai/profit-prediction/history').then((r) => r.data),

  pricePrediction: (payload) => api.post('/ai/price-prediction', payload).then((r) => r.data),
  pricePredictionHistory: () => api.get('/ai/price-prediction/history').then((r) => r.data),

  diseaseDetection: (formData) =>
    api.post('/ai/disease-detection', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  diseaseDetectionHistory: () => api.get('/ai/disease-detection/history').then((r) => r.data),

  generateFinancialAdvice: () => api.post('/ai/financial-advisor').then((r) => r.data),
  listFinancialAdvice: (params) => api.get('/ai/financial-advisor', { params }).then((r) => r.data),
  markAdviceRead: (id) => api.patch(`/ai/financial-advisor/${id}/read`).then((r) => r.data),
  dismissAdvice: (id) => api.delete(`/ai/financial-advisor/${id}`).then((r) => r.data),
};

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

export const weatherService = {
  getForFarm: (farmId) => api.get(`/weather/farm/${farmId}`).then((r) => r.data),
};

export const schemeService = {
  list: (params) => api.get('/schemes', { params }).then((r) => r.data),
  get: (id) => api.get(`/schemes/${id}`).then((r) => r.data),
};

export const reportService = {
  generate: (payload) => api.post('/reports/generate', payload).then((r) => r.data),
  list: (params) => api.get('/reports', { params }).then((r) => r.data),
};

export const marketplaceService = {
  createListing: (payload) => api.post('/marketplace/listings', payload).then((r) => r.data),
  browseListings: (params) => api.get('/marketplace/listings', { params }).then((r) => r.data),
  myListings: () => api.get('/marketplace/listings/mine').then((r) => r.data),
  updateListingStatus: (id, status) => api.patch(`/marketplace/listings/${id}/status`, { status }).then((r) => r.data),

  placeOrder: (payload) => api.post('/marketplace/orders', payload).then((r) => r.data),
  myOrders: (params) => api.get('/marketplace/orders/mine', { params }).then((r) => r.data),
  incomingOrders: (params) => api.get('/marketplace/orders/incoming', { params }).then((r) => r.data),
  updateOrderStatus: (id, status) => api.patch(`/marketplace/orders/${id}/status`, { status }).then((r) => r.data),
};

export const adminService = {
  overview: () => api.get('/admin/overview').then((r) => r.data),
  growthTrend: (months) => api.get('/admin/growth-trend', { params: { months } }).then((r) => r.data),
  listUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`).then((r) => r.data),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`).then((r) => r.data),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }).then((r) => r.data),
  allFarms: (params) => api.get('/admin/farms', { params }).then((r) => r.data),
};
