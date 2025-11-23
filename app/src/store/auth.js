import { defineStore } from 'pinia';
import api from '../services/api';

const TOKEN_KEY = 'realworld_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem(TOKEN_KEY) || '',
    loadingUser: false,
    authErrors: [],
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user && state.token),
    hasToken: (state) => Boolean(state.token),
    username: (state) => state.user?.username,
  },
  actions: {
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    },
    setUser(user) {
      this.user = user;
    },
    clearAuth() {
      this.user = null;
      this.setToken('');
    },
    async login(credentials) {
      this.authErrors = [];
      try {
        const { data } = await api.post('/users/login', { user: credentials });
        this.setUser(data.user);
        this.setToken(data.user.token);
        return data.user;
      } catch (error) {
        this.authErrors = api.formatErrors(error);
        throw error;
      }
    },
    async register(payload) {
      this.authErrors = [];
      try {
        const { data } = await api.post('/users', { user: payload });
        this.setUser(data.user);
        this.setToken(data.user.token);
        return data.user;
      } catch (error) {
        this.authErrors = api.formatErrors(error);
        throw error;
      }
    },
    async fetchCurrentUser() {
      if (!this.hasToken) return null;
      this.loadingUser = true;
      try {
        const { data } = await api.get('/user');
        this.setUser(data.user);
        return data.user;
      } finally {
        this.loadingUser = false;
      }
    },
    async updateSettings(updates) {
      this.authErrors = [];
      try {
        const { data } = await api.put('/user', { user: updates });
        this.setUser(data.user);
        this.setToken(data.user.token);
        return data.user;
      } catch (error) {
        this.authErrors = api.formatErrors(error);
        throw error;
      }
    },
    logout() {
      this.clearAuth();
    },
  },
});
