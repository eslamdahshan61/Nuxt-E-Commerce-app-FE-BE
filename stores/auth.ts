import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi';
import { parseValidationErrors } from '../utils/errorHandler';
import type { User, LoginCredentials, AuthResponse } from '../types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
    fieldErrors: {} as Record<string, string>,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;
      this.fieldErrors = {};

      try {
        const api = useApi();
        const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
        
        this.user = data.user;
        this.token = data.accessToken;

        if (process.client) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        return true;
      } catch (err: any) {
        const { fieldErrors, generalError } = parseValidationErrors(err);
        this.fieldErrors = fieldErrors;
        this.error = generalError || 'Unable to login';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const api = useApi();
        await api.post('/api/auth/logout');
      } finally {
        this.user = null;
        this.token = null;

        if (process.client) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },

    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          this.token = token;
          this.user = JSON.parse(userStr);
        }
      }
    },
  },
});
