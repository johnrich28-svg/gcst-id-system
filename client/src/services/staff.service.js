import api from './api';

export const getStaff = () => api.get('/staff');

export const verifyStaffPin = (staffId, pin) =>
  api.post('/staff/verify', { staffId, pin });

export const createStaff = (name, pin) =>
  api.post('/staff', { name, pin });

export const deactivateStaff = (id) => api.delete(`/staff/${id}`);
