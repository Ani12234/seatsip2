import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// ⚠️ CHANGE THIS to your computer's local IP when testing on a physical device
// e.g. 'http://192.168.1.100:3000/api/v1'
// Use 'http://10.0.2.2:3000/api/v1' for Android emulator
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  ios: 'http://localhost:3000/api/v1',
  web: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefresh);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ===== Cafes =====
export const cafesApi = {
  list: (params?: { city?: string; mood?: string; search?: string; sort?: string; limit?: number; offset?: number; recommended?: boolean }) =>
    api.get('/cafes', { params }),
  getById: (id: string) => api.get(`/cafes/${id}`),
  getMenu: (id: string) => api.get(`/cafes/${id}/menu`),
  getTables: (id: string, params?: { date?: string; time?: string; party_size?: number }) =>
    api.get(`/cafes/${id}/tables`, { params }),
  getReviews: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/cafes/${id}/reviews`, { params }),
  postReview: (id: string, data: { rating: number; comment?: string }) =>
    api.post(`/cafes/${id}/reviews`, data),
};

// ===== Orders =====
export const ordersApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: {
    cafe_id: string;
    items: { menu_item_id: string; quantity: number }[];
    order_type?: string;
    special_instructions?: string;
    payment_method?: string;
    reservation_id?: string;
  }) => api.post('/orders', data),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// ===== Reservations =====
export const reservationsApi = {
  list: () => api.get('/reservations'),
  getById: (id: string) => api.get(`/reservations/${id}`),
  create: (data: {
    cafe_id: string;
    table_id?: string;
    date: string;
    time: string;
    party_size: number;
    special_requests?: string;
    pre_order_items?: { menu_item_id: string; quantity: number }[];
  }) => api.post('/reservations', data),
  cancel: (id: string) => api.patch(`/reservations/${id}/cancel`),
};

// ===== Cart =====
export const cartApi = {
  get: () => api.get('/cart'),
  add: (cafe_id: string, menu_item_id: string, quantity?: number) =>
    api.post('/cart/add', { cafe_id, menu_item_id, quantity }),
  update: (id: string, quantity: number) => api.patch(`/cart/${id}`, { quantity }),
  clear: () => api.delete('/cart/clear'),
};

// ===== Users =====
export const usersApi = {
  profile: () => api.get('/users/profile'),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.patch('/users/profile', data),
  topupWallet: (amount: number) =>
    api.post('/users/wallet/topup', { amount }),
  walletTransactions: () => api.get('/users/wallet/transactions'),
};

// ===== Notifications =====
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;
