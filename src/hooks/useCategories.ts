import { useState, useEffect, useCallback } from 'react';
import { Category } from '../db/types';
import { getAllCategories } from '../db/categories';
import { useDatabase } from './useDatabase';

export function useCategories() {
  const { isReady, refreshKey } = useDatabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const data = await getAllCategories();
    setCategories(data);
    setLoading(false);
  }, [isReady]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  return { categories, loading, reload };
}
