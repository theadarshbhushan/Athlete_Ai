import api from './axios';

export const logSportsSession = (data) => api.post('/api/sports/session', data);
export const getSportsSessions = () => api.get('/api/sports/sessions');
export const getSportsPerformance = () => api.get('/api/sports/performance');
