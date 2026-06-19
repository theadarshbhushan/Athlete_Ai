import api from './axios';

export const getTodayPrediction = () => api.get('/api/predict/today');
export const getPredictionHistory = () => api.get('/api/predict/history');
