 import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';

const axiosInstance = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      if (!token) { if (active) setLoading(false); return; }
      try {
        const res = await axiosInstance.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const userData = res.data.data || res.data;
        if (active) setUser(userData);
      } catch { if (active) logout(); }
      finally { if (active) setLoading(false); }
    };
    fetchUser();
    return () => { active = false; };
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const responseData = res.data.data || res.data;
    const newToken = responseData.token;
    const userData = responseData.user;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData);
    const responseData = res.data.data || res.data;
    const newToken = responseData.token;
    const userData = responseData.user;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const api = useMemo(() => ({
    get: (url) => axiosInstance.get(url, { headers: { Authorization: `Bearer ${token}` } }),
    post: (url, data) => axiosInstance.post(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    put: (url, data) => axiosInstance.put(url, data, { headers: { Authorization: `Bearer ${token}` } }),
    delete: (url) => axiosInstance.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  }), [token]);

  const value = useMemo(() => ({ user, token, login, register, logout, api, loading }),
    [user, token, login, register, logout, api, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};