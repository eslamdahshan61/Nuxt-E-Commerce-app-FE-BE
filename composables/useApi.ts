import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiError } from '../types';

export const useApi = () => {
  const config = useRuntimeConfig();

  const api: AxiosInstance = axios.create({
    baseURL: config.public.apiBase as string,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      if (process.client) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        if (process.client) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        navigateTo('/login');
      }
      return Promise.reject(error);
    }
  );

  return api;
};
