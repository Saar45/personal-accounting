import { useState, useEffect, useCallback } from 'react';
import { RecurringTransactionWithCategory } from '../db/types';
import * as recurringDb from '../db/recurring';
import { useDatabase } from './useDatabase';

export function useRecurringTransactions() {
  const { isReady, refreshKey } = useDatabase();
  const [recurring, setRecurring] = useState<RecurringTransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const data = await recurringDb.getAllRecurring();
    setRecurring(data);
    setLoading(false);
  }, [isReady]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { recurring, loading, reload: load };
}
