import api from './axios';

export const getDashboardSummary = () => api.get('/api/analytics/dashboard-summary');
export const getTrainingLoad = (weeks = 8) =>
  api.get('/api/analytics/training-load', { params: { weeks } });
export const getRecoveryTrend = (days = 30) =>
  api.get('/api/analytics/recovery-trend', { params: { days } });
export const getSleepTrend = (days = 30) =>
  api.get('/api/analytics/sleep-trend', { params: { days } });
export const getStrengthProgress = () => api.get('/api/analytics/strength-progress');
export const getWorkoutConsistency = (weeks = 8) =>
  api.get('/api/analytics/workout-consistency', { params: { weeks } });
export const getCaloriesTrend = (days = 30) =>
  api.get('/api/analytics/calories-trend', { params: { days } });
export const getBodyfatProgress = () => api.get('/api/analytics/bodyfat-progress');
export const getPerformanceScore = (days = 30) =>
  api.get('/api/analytics/performance-score', { params: { days } });
