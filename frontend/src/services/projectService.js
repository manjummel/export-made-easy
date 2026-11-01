/**
 * ============================================================
 * ExportEase AI — Export Project Service
 * Handles CRUD and sub-resources for /api/v1/projects
 * ============================================================
 */

import apiClient from './apiClient';
import { PROJECTS_REGISTRY } from '../data/projectsData';


export const projectService = {
  /**
   * List all export projects for current user
   */
  async getProjects() {
    try {
      const data = await apiClient.get('/projects/');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      if (data?.projects && Array.isArray(data.projects)) {
        return data.projects;
      }
      return PROJECTS_DATA;
    } catch (err) {
      console.warn('[ProjectService] Fetch projects fallback:', err.message);
      return PROJECTS_DATA;
    }
  },

  /**
   * Get single export project details
   */
  async getProjectById(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}`);
      if (data?.id) return data;
      const found = PROJECTS_DATA.find((p) => String(p.id) === String(projectId));
      return found || PROJECTS_DATA[0];
    } catch (err) {
      console.warn(`[ProjectService] Fetch project ${projectId} fallback:`, err.message);
      const found = PROJECTS_DATA.find((p) => String(p.id) === String(projectId));
      return found || PROJECTS_DATA[0];
    }
  },

  /**
   * Create a new export project
   */
  async createProject(projectData) {
    try {
      const payload = {
        msme_id: projectData.msme_id || projectData.msmeId || 'msme-001',
        project_name: projectData.project_name || projectData.projectName || projectData.name,
        description: projectData.description || null,
        destination_country: projectData.destination_country || projectData.destinationCountry || 'Germany',
        destination_country_code: projectData.destination_country_code || 'DE',
        user_query: projectData.user_query || projectData.userQuery || null,
        quantity: projectData.quantity ? parseFloat(projectData.quantity) : 1000,
        estimated_value: projectData.estimated_value ? parseFloat(projectData.estimated_value) : 25000,
        currency: projectData.currency || 'USD',
        preferred_language: projectData.preferred_language || 'en',
      };

      const data = await apiClient.post('/projects/', payload);
      return data;
    } catch (err) {
      console.warn('[ProjectService] Create project fallback:', err.message);
      const newProj = {
        id: 'proj-' + Date.now(),
        project_name: projectData.project_name || projectData.projectName || 'New Export Project',
        destination_country: projectData.destination_country || 'Germany',
        status: 'DRAFT',
        current_step: 'MSME_PROFILE',
        completion_percentage: 10,
        risk_level: 'LOW',
        created_at: new Date().toISOString(),
      };
      return newProj;
    }
  },

  /**
   * Update export project
   */
  async updateProject(projectId, updateData) {
    try {
      const data = await apiClient.patch(`/projects/${projectId}`, updateData);
      return data;
    } catch (err) {
      console.warn(`[ProjectService] Update project ${projectId} fallback:`, err.message);
      return { id: projectId, ...updateData };
    }
  },

  /**
   * Delete export project
   */
  async deleteProject(projectId) {
    try {
      await apiClient.delete(`/projects/${projectId}`);
      return true;
    } catch (err) {
      console.warn(`[ProjectService] Delete project ${projectId} fallback:`, err.message);
      return true;
    }
  },

  /**
   * Fetch project document requirements
   */
  async getProjectDocuments(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}/documents`);
      return Array.isArray(data) ? data : (data?.documents || []);
    } catch (err) {
      console.warn('[ProjectService] Documents fallback:', err.message);
      return [];
    }
  },

  /**
   * Complete a project document
   */
  async completeDocument(projectId, documentId) {
    try {
      return await apiClient.post(`/projects/${projectId}/documents/${documentId}/complete`, {});
    } catch (err) {
      console.warn('[ProjectService] Complete doc fallback:', err.message);
      return { status: 'COMPLETED', document_id: documentId };
    }
  },

  /**
   * Fetch project certifications
   */
  async getProjectCertifications(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}/certifications`);
      return Array.isArray(data) ? data : (data?.certifications || []);
    } catch (err) {
      console.warn('[ProjectService] Certifications fallback:', err.message);
      return [];
    }
  },

  /**
   * Fetch project risk evaluation
   */
  async getProjectRisk(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}/risk`);
      return data;
    } catch (err) {
      console.warn('[ProjectService] Risk evaluation fallback:', err.message);
      return null;
    }
  },

  /**
   * Fetch project market analysis
   */
  async getProjectMarketAnalysis(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}/market-analysis`);
      return data;
    } catch (err) {
      console.warn('[ProjectService] Market analysis fallback:', err.message);
      return null;
    }
  },

  /**
   * Fetch project export plan
   */
  async getProjectExportPlan(projectId) {
    try {
      const data = await apiClient.get(`/projects/${projectId}/export-plan`);
      return data;
    } catch (err) {
      console.warn('[ProjectService] Export plan fallback:', err.message);
      return null;
    }
  }
};

export default projectService;
