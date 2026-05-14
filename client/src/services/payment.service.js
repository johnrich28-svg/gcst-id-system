import api from './api';

export const initiatePayment = async (requestId, method) => {
  const response = await api.post('/payment/initiate', { requestId, method });
  return response.data;
};
