import { api } from './apiClient';

export const farmService = {
  list: () => api.get('/farms').then((r) => r.data),
  get: (id) => api.get(`/farms/${id}`).then((r) => r.data),
  create: (payload) => api.post('/farms', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/farms/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/farms/${id}`).then((r) => r.data),
  stats: () => api.get('/farms/summary/stats').then((r) => r.data),
};

export const cropService = {
  list: (params) => api.get('/crops', { params }).then((r) => r.data),
  get: (id) => api.get(`/crops/${id}`).then((r) => r.data),
  create: (payload) => api.post('/crops', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/crops/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/crops/${id}`).then((r) => r.data),
  cropWiseSummary: () => api.get('/crops/summary/crop-wise').then((r) => r.data),
};

export const expenseService = {
  list: (params) => api.get('/expenses', { params }).then((r) => r.data),
  get: (id) => api.get(`/expenses/${id}`).then((r) => r.data),
  create: (formData) => api.post('/expenses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id, formData) => api.patch(`/expenses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
  breakdown: (params) => api.get('/expenses/summary/breakdown', { params }).then((r) => r.data),
  monthlyTrend: (months) => api.get('/expenses/summary/monthly-trend', { params: { months } }).then((r) => r.data),
};

export const saleService = {
  list: (params) => api.get('/sales', { params }).then((r) => r.data),
  get: (id) => api.get(`/sales/${id}`).then((r) => r.data),
  create: (formData) => api.post('/sales', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id, formData) => api.patch(`/sales/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => api.delete(`/sales/${id}`).then((r) => r.data),
  monthlyRevenue: (months) => api.get('/sales/summary/monthly-revenue', { params: { months } }).then((r) => r.data),
  yearlyRevenue: (years) => api.get('/sales/summary/yearly-revenue', { params: { years } }).then((r) => r.data),
};

export const dashboardService = {
  overview: () => api.get('/dashboard/overview').then((r) => r.data),
  investmentTrend: (months) => api.get('/dashboard/investment-trend', { params: { months } }).then((r) => r.data),
  profitTrend: (months) => api.get('/dashboard/profit-trend', { params: { months } }).then((r) => r.data),
  expenseBreakdown: (params) => api.get('/dashboard/expense-breakdown', { params }).then((r) => r.data),
  cropWiseProfit: () => api.get('/dashboard/crop-wise-profit').then((r) => r.data),
  revenue: (range) => api.get('/dashboard/revenue', { params: { range } }).then((r) => r.data),
  roiAnalysis: () => api.get('/dashboard/roi-analysis').then((r) => r.data),
};
