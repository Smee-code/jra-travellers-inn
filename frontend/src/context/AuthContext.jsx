import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('ti_access');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me/');
      setUser(data);
    } catch {
      localStorage.removeItem('ti_access');
      localStorage.removeItem('ti_refresh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    localStorage.setItem('ti_access', data.access);
    localStorage.setItem('ti_refresh', data.refresh);
    setUser({
      id: data.id,
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      role: data.role,
    });
    return data.role;
  };

  const register = async (payload) => {
    await api.post('/auth/register/', payload);
    return login(payload.username, payload.password);
  };

  const logout = () => {
    localStorage.removeItem('ti_access');
    localStorage.removeItem('ti_refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reload: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
