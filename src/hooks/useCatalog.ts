import { useState, useEffect, useCallback } from 'react';
import api from '@/api/client';
import type { Product } from '@/types';

interface UseCatalogReturn {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCatalog(): UseCatalogReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCatalog();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return { products, categories, loading, error, refetch: fetchCatalog };
}