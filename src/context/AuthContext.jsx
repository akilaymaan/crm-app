import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cliento_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cliento_token');
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { 
          localStorage.removeItem('cliento_token'); 
          localStorage.removeItem('cliento_user'); 
          setUser(null); 
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('cliento_token', data.token);
    localStorage.setItem('cliento_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('cliento_token', data.token);
    localStorage.setItem('cliento_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cliento_token');
    localStorage.removeItem('cliento_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name, email) => {
    const { data } = await authAPI.updateDetails({ name, email });
    localStorage.setItem('cliento_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
