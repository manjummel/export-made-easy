/**
 * ============================================================
 * ExportEase AI — Authentication Service
 * Communicates with /api/v1/auth & /api/v1/users endpoints
 * ============================================================
 */

import apiClient from './apiClient';
import { COMPANY } from '../data/dashboardData';

const USER_STORAGE_KEY = 'exportease_user_profile';

export const authService = {
  /**
   * Log in user
   */
  async login(email, password) {
    try {
      const data = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (data?.access_token) {
        apiClient.setTokens(data.access_token, data.refresh_token);
        
        // Fetch current user details
        const me = await this.getCurrentUser().catch(() => null);
        const userObj = me || {
          id: data.user_id || 'user-001',
          email,
          role: data.role || 'MSME_USER',
          fullName: 'Admin User',
          companyName: COMPANY.name,
          iec: COMPANY.iec,
          gstin: COMPANY.gstin,
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
        return { user: userObj, tokens: data };
      }
      return data;
    } catch (err) {
      console.warn('[AuthService] Login fallback:', err.message);
      // Fallback demo user
      const fallbackUser = {
        id: 'user-001',
        email,
        role: 'MSME_USER',
        fullName: 'Admin User',
        companyName: COMPANY.name,
        iec: COMPANY.iec,
        gstin: COMPANY.gstin,
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser));
      return { user: fallbackUser };
    }
  },

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const data = await apiClient.post('/auth/register', {
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        full_name: userData.fullName || userData.full_name,
        phone: userData.phone || null,
        company_name: userData.companyName || userData.company_name || COMPANY.name,
      });
      return data;
    } catch (err) {
      console.warn('[AuthService] Register fallback:', err.message);
      return {
        id: 'user-' + Date.now(),
        email: userData.email,
        full_name: userData.fullName,
      };
    }
  },

  /**
   * Fetch authenticated user details (/auth/me)
   */
  async getCurrentUser() {
    try {
      const data = await apiClient.get('/auth/me');
      if (data) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    } catch (err) {
      const cached = localStorage.getItem(USER_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
      return null;
    }
  },

  /**
   * Log out user
   */
  logout() {
    apiClient.clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  /**
   * Get cached user or default exporter demo context
   */
  getStoredUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }

    return {
      id: 'user-001',
      email: 'admin@yourcompany.com',
      fullName: 'Admin User',
      role: 'Export Manager',
      companyName: COMPANY.name,
      legalName: 'Your Company Legal Name',
      iec: COMPANY.iec,
      gstin: COMPANY.gstin,
      origin: COMPANY.origin,
      product: COMPANY.product,
      hsCode: COMPANY.hsCode,
    };
  },

  /**
   * Ensure default exporter account is set up for demo and local development
   */
  async ensureDefaultUser() {
    const token = apiClient.getToken();
    if (!token) {
      // Auto-login default account
      try {
        await this.login('usha@exportease.ai', 'ExportEase@2026');
      } catch {
        const defaultUser = this.getStoredUser();
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    }
  }
};

export default authService;
