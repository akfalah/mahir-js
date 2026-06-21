import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const SKIP_REDIRECT = ['/auth/profile', '/auth/sign-in', '/auth/sign-up'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isSkipped = SKIP_REDIRECT.some((path) => url.includes(path));

    if (error.response?.status === 401 && !isSkipped) {
      window.location.href = '/sign-in';
    }

    return Promise.reject(error);
  },
);

export default api;