import api from './api';

export const getRequests = async (params = {}) => {
  const response = await api.get('/admin/requests', { params });
  return response.data;
};

export const getRequestDetails = async (id) => {
  const response = await api.get(`/admin/request/${id}`);
  return response.data;
};

export const validateRequest = async (id, data) => {
  const response = await api.post(`/validation/${id}`, data);
  return response.data;
};

export const getGeneratedIds = async (params = {}) => {
  const response = await api.get('/id/generated', { params });
  return response.data;
};

export const updateIdStatus = async (id, data) => {
  const response = await api.put(`/id/release/${id}`, data);
  return response.data;
};

export const getBatches = async () => {
  const response = await api.get('/admin/batches');
  return response.data;
};

export const runAutoBatch = async () => {
  const response = await api.post('/admin/batches/auto');
  return response.data;
};

export const updateBatchReleaseDate = async (id, releaseDate) => {
  const response = await api.put(`/admin/batches/${id}/release-date`, { releaseDate });
  return response.data;
};

export const generateIdCard = async (requestId, staffId = null) => {
  const response = await api.post(`/id/generate/${requestId}`, { staffId });
  return response.data;
};

export const confirmPayment = async (requestId) => {
  const response = await api.post(`/admin/request/${requestId}/confirm-payment`);
  return response.data;
};

// Open a PDF download in a new tab (served from the server)
export const downloadIdPdf = (generatedId, side) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token || '';
  const url = `${base}/id/download/${generatedId}/${side}?token=${token}`;
  window.open(url, '_blank');
};
