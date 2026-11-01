import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import apiClient from '../services/apiClient';
import { COMPANY } from '../data/dashboardData';
import { DEMO_PROFILES } from '../data/demoProfiles';

const AuthContext = createContext({
  user: null,
  msmeProfile: null,
  isAuthenticated: false,
  isBackendConnected: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: () => {},
  switchProfile: () => {},
});

export function AuthProvider({ children }) {
  // isAuthenticated only becomes true after an explicit login call
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem('exportease_auth_state');
      return stored === 'true';
    } catch { return false; }
  });
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [msmeProfile, setMsmeProfile] = useState(() => ({
    companyName: COMPANY.name,
    iec: COMPANY.iec,
    gstin: COMPANY.gstin,
    origin: COMPANY.origin,
    product: COMPANY.product,
    hsCode: COMPANY.hsCode,
    targetMarkets: ['United States', 'Germany', 'United Arab Emirates'],
  }));
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Check backend health only (no auto-login)
  useEffect(() => {
    let mounted = true;
    async function checkConnection() {
      const isHealthy = await apiClient.checkHealth();
      if (mounted) setIsBackendConnected(isHealthy);
    }
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);


  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result?.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('exportease_auth_state', 'true');
    }
    return result;
  }, []);

  const register = useCallback(async (userData) => {
    const result = await authService.register(userData);
    if (result?.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('exportease_auth_state', 'true');
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('exportease_auth_state');
  }, []);

  const updateProfile = useCallback((updates) => {
    setMsmeProfile((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('exportease_user_profile', JSON.stringify(next));
      return next;
    });
  }, []);

  const switchProfile = useCallback((profileKey) => {
    const demo = DEMO_PROFILES[profileKey];
    if (demo) {
      const newProf = {
        companyName: demo.name,
        iec: demo.iec,
        gstin: demo.gstin,
        origin: demo.origin,
        product: demo.product,
        hsCode: demo.hsCode,
        targetMarkets: demo.targetMarkets,
      };
      setMsmeProfile(newProf);
      setUser((prev) => ({
        ...(prev || {}),
        fullName: demo.owner || 'Usha Bharathi L',
        companyName: demo.name,
        iec: demo.iec,
        gstin: demo.gstin,
        origin: demo.origin,
        product: demo.product,
        hsCode: demo.hsCode,
      }));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        msmeProfile,
        isAuthenticated,
        isBackendConnected,
        login,
        register,
        logout,
        updateProfile,
        switchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
