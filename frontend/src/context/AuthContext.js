import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { setTokens, clearTokens, getAccessToken } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('farmledger_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((userData) => {
    setUser(userData);
    if (userData) localStorage.setItem('farmledger_user', JSON.stringify(userData));
    else localStorage.removeItem('farmledger_user');
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        persistUser(res.data);
      } catch (err) {
        clearTokens();
        persistUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    persistUser(res.data.user);
    return res.data.user;
  }, [persistUser]);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    persistUser(res.data.user);
    return res.data.user;
  }, [persistUser]);

  const googleLogin = useCallback(async (idToken) => {
    const res = await authService.googleLogin(idToken);
    setTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    persistUser(res.data.user);
    return res.data.user;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore network errors on logout
    } finally {
      clearTokens();
      persistUser(null);
    }
  }, [persistUser]);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('farmledger_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user, loading, isAuthenticated: !!user,
      login, register, googleLogin, logout, updateUser,
    }),
    [user, loading, login, register, googleLogin, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
