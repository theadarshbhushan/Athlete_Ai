import api from './axios';

export const getProfile = () => api.get('/api/user/profile');
export const updateProfile = (data) => api.put('/api/user/profile', data);
export const updatePassword = (data) => api.put('/api/user/password', data);
