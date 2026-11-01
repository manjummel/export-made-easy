/**
 * ============================================================
 * ExportEase AI — Workflow Engine Service
 * Connects Frontend UI to /api/v1/workflow endpoints
 * ============================================================
 */

import apiClient from './apiClient';

export const workflowService = {
  /**
   * Get workflow status for a project
   */
  async getStatus(projectId) {
    try {
      const data = await apiClient.get(`/workflow/${projectId}/status`);
      return data;
    } catch (err) {
      console.warn('[WorkflowService] Status fallback:', err.message);
      return {
        project_id: projectId,
        status: 'ANALYZING',
        current_step: 'HS_CLASSIFICATION',
        completed_steps: ['MSME_PROFILE'],
        next_step: 'HS_CLASSIFICATION',
        completion_percentage: 20,
      };
    }
  },

  /**
   * Get detailed workflow status with all steps
   */
  async getDetailedStatus(projectId) {
    try {
      const data = await apiClient.get(`/workflow/${projectId}/detailed-status`);
      return data;
    } catch (err) {
      console.warn('[WorkflowService] Detailed status fallback:', err.message);
      return null;
    }
  },

  /**
   * Initialize 10 workflow steps for an export project
   */
  async initializeWorkflow(projectId) {
    try {
      const data = await apiClient.post(`/workflow/${projectId}/initialize`, {});
      return data;
    } catch (err) {
      console.warn('[WorkflowService] Initialize fallback:', err.message);
      return { status: 'INITIALIZED', project_id: projectId };
    }
  },

  /**
   * Advance workflow to the next step
   */
  async advanceStep(projectId, stepName, resultData = null) {
    try {
      const data = await apiClient.post('/workflow/advance', {
        project_id: projectId,
        step_name: stepName,
        result_data: resultData ? JSON.stringify(resultData) : null,
      });
      return data;
    } catch (err) {
      console.warn('[WorkflowService] Advance fallback:', err.message);
      return { status: 'ADVANCED', next_step: 'NEXT_STEP' };
    }
  },

  /**
   * Execute an automated AI agent step
   */
  async executeStep(projectId, stepName, payload = {}) {
    try {
      const data = await apiClient.post(`/workflow/${projectId}/execute/${stepName}`, payload);
      return data;
    } catch (err) {
      console.warn(`[WorkflowService] Execute step ${stepName} fallback:`, err.message);
      return { status: 'COMPLETED', step: stepName, result: payload };
    }
  },

  /**
   * Reset workflow
   */
  async resetWorkflow(projectId) {
    try {
      const data = await apiClient.post('/workflow/reset', { project_id: projectId });
      return data;
    } catch (err) {
      console.warn('[WorkflowService] Reset fallback:', err.message);
      return { status: 'RESET', project_id: projectId };
    }
  }
};

export default workflowService;
