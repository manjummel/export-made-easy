/**
 * ============================================================
 * ExportEase AI — MSME Business & Product Service
 * Handles /api/v1/msme-profiles, /api/v1/businesses, /api/v1/products
 * ============================================================
 */

import apiClient from './apiClient';
import { COMPANY } from '../data/dashboardData';

export const msmeService = {
  /**
   * Fetch user MSME profiles
   */
  async getProfiles() {
    try {
      const data = await apiClient.get('/msme-profiles/');
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      console.warn('[MSMEService] Fetch profiles fallback:', err.message);
      return [
        {
          id: 'msme-001',
          company_name: COMPANY.name,
          iec_code: COMPANY.iec,
          gstin: COMPANY.gstin,
          city: 'Moradabad',
          state: 'Uttar Pradesh',
          industry_sector: 'Handicrafts & Home Decor',
        }
      ];
    }
  },

  /**
   * Create or update MSME profile
   */
  async createProfile(profileData) {
    try {
      const payload = {
        company_name: profileData.company_name || profileData.companyName || COMPANY.name,
        gstin: profileData.gstin || COMPANY.gstin,
        iec_code: profileData.iec_code || profileData.iecCode || COMPANY.iec,
        udyam_number: profileData.udyam_number || profileData.udyamNumber || null,
        msme_category: profileData.msme_category || 'SMALL',
        industry_sector: profileData.industry_sector || 'Handicrafts',
        registered_address: profileData.registered_address || profileData.origin || COMPANY.origin,
        city: profileData.city || 'Moradabad',
        state: profileData.state || 'Uttar Pradesh',
        pincode: profileData.pincode || '244001',
        export_experience_years: profileData.export_experience_years || 4,
        annual_turnover_inr: profileData.annual_turnover_inr || 45000000,
      };

      const data = await apiClient.post('/msme-profiles/', payload);
      return data;
    } catch (err) {
      console.warn('[MSMEService] Create profile fallback:', err.message);
      return { id: 'msme-001', ...profileData };
    }
  },

  /**
   * Create business entity under MSME profile
   */
  async createBusiness(businessData) {
    try {
      const payload = {
        msme_id: businessData.msme_id || businessData.msmeId || 'msme-001',
        business_name: businessData.business_name || businessData.businessName || COMPANY.name,
        business_type: businessData.business_type || 'Manufacturing & Export',
        description: businessData.description || 'Export manufacturer of premium handicrafts and textiles',
        primary_activity: 'Export Manufacturing',
      };
      const data = await apiClient.post('/businesses/', payload);
      return data;
    } catch (err) {
      console.warn('[MSMEService] Create business fallback:', err.message);
      return { id: 'biz-001', ...businessData };
    }
  },

  /**
   * Create product
   */
  async createProduct(productData) {
    try {
      const payload = {
        business_id: productData.business_id || productData.businessId || 'biz-001',
        product_name: productData.product_name || productData.productName || COMPANY.product,
        description: productData.description || null,
        category: productData.category || 'Handicrafts',
        hs_code: productData.hs_code || productData.hsCode || COMPANY.hsCode,
        quantity: productData.quantity ? parseFloat(productData.quantity) : 1000,
        unit_price_usd: productData.unit_price_usd ? parseFloat(productData.unit_price_usd) : 25,
        raw_materials: productData.raw_materials || 'Solid Brass',
        intended_destination: productData.intended_destination || 'United States',
      };
      const data = await apiClient.post('/products/', payload);
      return data;
    } catch (err) {
      console.warn('[MSMEService] Create product fallback:', err.message);
      return { id: 'prod-001', ...productData };
    }
  },

  /**
   * Execute AI analysis on a registered product
   */
  async analyzeProduct(productId) {
    try {
      const data = await apiClient.post('/products/analyze', { product_id: productId });
      return data;
    } catch (err) {
      console.warn('[MSMEService] Analyze product fallback:', err.message);
      return { id: productId, status: 'ANALYZED' };
    }
  }
};

export default msmeService;
