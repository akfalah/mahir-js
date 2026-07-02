import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined.');
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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
