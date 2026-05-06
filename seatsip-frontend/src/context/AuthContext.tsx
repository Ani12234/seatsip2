import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateStoredUser: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, storedUser] = await AsyncStorage.multiGet(['accessToken', 'user']);
      if (token[1] && storedUser[1]) {
        setAccessToken(token[1]);
        setUser(JSON.parse(storedUser[1]));
        // Refresh user data from server
        try {
          const { data } = await authApi.me();
          setUser(data.data);
          await AsyncStorage.setItem('user', JSON.stringify(data.data));
        } catch {}
      }
    } catch (e) {
      console.error('loadStoredAuth error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    const { user, accessToken, refreshToken } = data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const { data } = await authApi.register({ name, email, password, phone });
    const { user, accessToken, refreshToken } = data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      await authApi.logout(refreshToken || undefined);
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.data);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
    } catch {}
  }, []);

  const updateStoredUser = useCallback(async (patch: Partial<User>) => {
    if (!user) return;

    const nextUser = { ...user, ...patch };
    setUser(nextUser);
    await AsyncStorage.setItem('user', JSON.stringify(nextUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, accessToken, isLoading,
      isAuthenticated: !!user,
      login, register, logout, refreshUser, updateStoredUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
