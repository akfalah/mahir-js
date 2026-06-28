import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';

    const skipRedirect =
      url.includes('/auth/profile') ||
      url.includes('/auth/sign-in') ||
      url.includes('/auth/sign-up');

    if (error.response?.status === 401 && !skipRedirect) {
      window.location.href = '/sign-in';
    }

    return Promise.reject(error);
  },
);

export default api;
