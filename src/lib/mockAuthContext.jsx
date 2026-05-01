import React, { createContext, useState, useContext } from 'react';
import { MOCK_USER } from './mockData';
import { mockBase44 } from './mockClient';

const AuthContext = createContext();

// Estado global em memória para persistir durante a sessão
let sessionUser = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(sessionUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionUser);
  const isLoadingAuth = false;
  const isLoadingPublicSettings = false;
  const authError = null;

  const login = (email, password) => {
    // Qualquer email/senha funciona — retorna o usuário admin mockado
    const loggedUser = { ...MOCK_USER, email: email || MOCK_USER.email };
    sessionUser = loggedUser;
    mockBase44._setSessionUser(loggedUser);
    setUser(loggedUser);
    setIsAuthenticated(true);
    return loggedUser;
  };

  const logout = () => {
    sessionUser = null;
    mockBase44._clearSessionUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    logout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: {},
      authChecked: true,
      login,
      logout,
      navigateToLogin,
      checkUserAuth: () => {},
      checkAppState: () => {},
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