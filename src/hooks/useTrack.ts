import { useState, useEffect, useCallback } from 'react';
import api from '@/api/client';
import type { TrackingResponse } from '@/types';

interface UseTrackReturn {
  tracking: TrackingResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrack(orderRef: string | undefined): UseTrackReturn {
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!orderRef) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(orderRef);
      setTracking(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load tracking info'
      );
    } finally {
      setLoading(false);
    }
  }, [orderRef]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto-poll every 15 seconds
  useEffect(() => {
    if (!orderRef) return;
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [orderRef, fetchTracking]);

  return { tracking, loading, error, refetch: fetchTracking };
}