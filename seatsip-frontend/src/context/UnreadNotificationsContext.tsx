import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/api';
import { loadTokens } from '../security/secureStorage';

const UnreadNotificationsContext = createContext({
  unreadCount: 0,
  refreshUnread: async () => {},
});

export function UnreadNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    const tokens = await loadTokens();
    if (!tokens?.accessToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await notificationsApi.unreadCount();
      const n = Number((data as { data?: { count?: number } })?.data?.count ?? 0);
      setUnreadCount(Number.isFinite(n) ? n : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    void refreshUnread();
    const id = setInterval(() => void refreshUnread(), 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated, refreshUnread]);

  const value = useMemo(() => ({ unreadCount, refreshUnread }), [unreadCount, refreshUnread]);

  return <UnreadNotificationsContext.Provider value={value}>{children}</UnreadNotificationsContext.Provider>;
}

export function useUnreadNotifications() {
  return useContext(UnreadNotificationsContext);
}
