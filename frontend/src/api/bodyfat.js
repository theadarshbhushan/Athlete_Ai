import api from './axios';

export const estimateBodyfat = (data) => api.post('/api/bodyfat/estimate', data);
export const uploadBodyfatPhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/bodyfat/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const getBodyfatHistory = () => api.get('/api/bodyfat/history');
