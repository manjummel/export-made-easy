/**
 * useExportReadiness — Hook to fetch and manage export readiness score.
 */
import { useState, useEffect } from 'react';
import { getExportReadinessScore } from '../services/aiService';

export function useExportReadiness() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExportReadinessScore()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
