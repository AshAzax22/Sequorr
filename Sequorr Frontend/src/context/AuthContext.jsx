import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth } from '../api/health';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sequorr_admin_key');
      if (token) {
        try {
          // Verify token by making an authenticated request or health check
          // The health check doesn't strictly test the key, so we assume if we have a key we're logged in.
          // Note: Real validation happens when making actual admin API calls.
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('sequorr_admin_key');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (key) => {
    // Basic verification - store the key
    localStorage.setItem('sequorr_admin_key', key);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('sequorr_admin_key');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
