import { useState, useEffect } from 'react';
import { BudgetWithProgress } from '../db/types';
import * as budgetsDb from '../db/budgets';
import { useDatabase } from './useDatabase';
import { getCurrentMonthYear } from '../utils/dates';

export function useBudgetProgress() {
  const { isReady, refreshKey } = useDatabase();
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const { year, month } = getCurrentMonthYear();
    budgetsDb.getBudgetProgress(year, month).then((data) => {
      setBudgets(data);
      setLoading(false);
    });
  }, [isReady, refreshKey]);

  return { budgets, loading };
}
