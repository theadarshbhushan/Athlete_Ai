import api from './axios';

export const logWorkout = (data) => api.post('/api/workouts', data);
export const getWorkouts = (params) => api.get('/api/workouts', { params });
export const getWeeklySummary = () => api.get('/api/workouts/summary/weekly');
export const deleteWorkout = (id) => api.delete(`/api/workouts/${id}`);
