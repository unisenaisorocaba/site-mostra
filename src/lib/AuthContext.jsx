import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      setIsLoadingAuth(true);
      // Busca informações básicas decodificadas do token
      const userRes = await api.get('/users/me');
      setUser(userRes.data);

      // Busca perfil completo cadastrado
      try {
        const profileRes = await api.get('/users/profile');
        setProfile(profileRes.data);
      } catch (profErr) {
        console.warn('Perfil do usuário não encontrado:', profErr.message);
        setProfile(null);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Falha ao validar sessão:', error);
      logout();
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      
      await checkUserAuth();
      return true;
    } catch (error) {
      console.error('Falha no login:', error);
      const errMsg = error.response?.data?.error || 'Credenciais inválidas';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/register', userData);
      return res.data;
    } catch (error) {
      console.error('Falha no cadastro:', error);
      const errMsg = error.response?.data?.error || 'Erro ao cadastrar';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
