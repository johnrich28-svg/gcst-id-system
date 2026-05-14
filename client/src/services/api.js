import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  // Dynamically use current hostname so it works on both PC (localhost) and phone (network IP)
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for auth tokens
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
