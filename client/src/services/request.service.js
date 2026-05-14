import api from './api';

export const submitIdRequest = async (formData) => {
  // Use multipart/form-data for file uploads
  const response = await api.post('/request', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const trackIdRequest = async (referenceNumber) => {
  const response = await api.get(`/request/${referenceNumber}`);
  return response.data;
};
