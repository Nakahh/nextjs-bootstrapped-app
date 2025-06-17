import api from './api';

const AUTH_TOKEN_KEY = '@SiqueiraCampos:token';
const USER_KEY = '@SiqueiraCampos:user';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  },

  async loginWithGoogle(accessToken) {
    const response = await api.post('/auth/google/token', { accessToken });
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    this.setUser(response.data);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh-token');
    this.setToken(response.data.token);
    return response.data;
  },

  setToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  handleGoogleCallback(token) {
    this.setToken(token);
    return this.getMe();
  }
};

export default authService;
