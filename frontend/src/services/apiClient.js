/**
 * ============================================================
 * ExportEase AI — Centralized API Client
 * Connects Frontend UI to FastAPI Backend (/api/v1)
 * ============================================================
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.isOnline = true;
  }

  /**
   * Retrieve JWT access token from localStorage
   */
  getToken() {
    return localStorage.getItem('exportease_access_token') || null;
  }

  /**
   * Set JWT tokens
   */
  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('exportease_access_token', accessToken);
    if (refreshToken) localStorage.setItem('exportease_refresh_token', refreshToken);
  }

  /**
   * Clear JWT tokens
   */
  clearTokens() {
    localStorage.removeItem('exportease_access_token');
    localStorage.removeItem('exportease_refresh_token');
  }

  /**
   * Attempt token refresh
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('exportease_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const envelope = await response.json();
      const data = envelope.data || envelope;
      if (data.access_token) {
        this.setTokens(data.access_token, data.refresh_token || refreshToken);
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Core request method
   */
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const token = this.getToken();

    const headers = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await this.refreshToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            if (retryRes.ok) return await retryRes.json();
          }
        }
        const errorText = await response.text();
        const err = new Error(`HTTP ${response.status}: ${errorText}`);
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (err) {
      // Allow caller to fallback gracefully if backend is offline
      err.isMockError = true;
      throw err;
    }
  }

  // Convenience HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    const formattedBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.request(endpoint, { ...options, method: 'POST', body: formattedBody });
  }

  put(endpoint, body, options = {}) {
    const formattedBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.request(endpoint, { ...options, method: 'PUT', body: formattedBody });
  }

  patch(endpoint, body, options = {}) {
    const formattedBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.request(endpoint, { ...options, method: 'PATCH', body: formattedBody });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  upload(endpoint, formData, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: formData });
  }

  /**
   * Health check to detect live backend status
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
