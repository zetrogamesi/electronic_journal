import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Fetch current user from DB and sync state
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await api.get('/auth/me');
      // Always use DB data — admin status may have changed since last login
      const fresh = res.data;
      setUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh on mount
  useEffect(() => { refreshUser(); }, [refreshUser]);

  // Also refresh when the browser tab regains focus
  // (so after running make-admin.js and switching back, rights update automatically)
  useEffect(() => {
    const onFocus = () => { if (localStorage.getItem('token')) refreshUser(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshUser]);

  const login = useCallback(async (name, group_id, password) => {
    const res = await api.post('/auth/login', { name, group_id, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (name, group_id, password) => {
    const res = await api.post('/auth/register', { name, group_id, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
