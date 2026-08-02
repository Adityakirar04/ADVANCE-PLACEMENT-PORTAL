 import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 15000,
  });

  // Token interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    if (res.data?.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    
    // Hamesha response return karo — chahe success ho ya na ho
    return res.data;
  };

  // ============================================
  // REGISTER — Fixed: hamesha response return
  // ============================================
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    
    // 🔥 FIX: Backend se jo bhi aaye, return karo
    // Chahe success ho ya error, frontend handle karega
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data) setUser(res.data.data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);