import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { DEMO_MODE } from '../config';

const AuthContext = createContext();

function parseTokenFromHash() {
  const hash = window.location.hash?.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get('token');
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((token, sessionUser) => {
    api.setStoredToken(token);
    setUser(sessionUser);
    setAuthenticated(true);
  }, []);

  const restoreSession = useCallback(async () => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }

    const hashToken = parseTokenFromHash();
    if (hashToken) {
      window.history.replaceState(null, '', window.location.pathname);
      api.setStoredToken(hashToken);
    }

    const token = api.getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { user: me } = await api.getMe();
      applySession(token, me);
    } catch {
      api.setStoredToken(null);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, password) => {
    if (DEMO_MODE) {
      if (email && password) {
        applySession('demo-token', {
          id: 1,
          email,
          name: 'Administrador (demo)',
          role: 'admin',
        });
        return true;
      }
      throw new Error('Credenciais inválidas');
    }
    const { token, user: loggedUser } = await api.login(email, password);
    applySession(token, loggedUser);
    return true;
  };

  const logout = () => {
    api.setStoredToken(null);
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, demoMode: DEMO_MODE }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
