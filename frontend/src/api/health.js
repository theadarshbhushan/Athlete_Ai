import api from './axios';

export const logHealthMetrics = (data) => api.post('/api/health/metrics', data);
export const getTodayMetrics = () => api.get('/api/health/metrics/today');
export const getHealthHistory = (days = 30) =>
  api.get('/api/health/metrics/history', { params: { days } });
export const getSleepTrend = (days = 7) =>
  api.get('/api/health/sleep/trend', { params: { days } });
export const getHeartRateTrend = (days = 7) =>
  api.get('/api/health/heart-rate/trend', { params: { days } });
