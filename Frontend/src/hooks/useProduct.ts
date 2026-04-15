import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import type { Product } from '../types';

interface UseProductReturn {
  product: Product | null;
  related: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProduct(id: string | undefined): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProduct(id);
      setProduct(data.product);
      setRelated(data.related);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load product';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, related, loading, error, refetch: fetchProduct };
}