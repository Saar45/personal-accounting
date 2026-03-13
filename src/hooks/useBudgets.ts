import { useState, useEffect } from 'react';
import { BudgetWithProgress } from '../db/types';
import * as budgetsDb from '../db/budgets';
import { useDatabase } from './useDatabase';
import { useExchangeRates } from './useExchangeRates';
import { getCurrentMonthYear } from '../utils/dates';

export function useBudgetProgress() {
  const { isReady, refreshKey } = useDatabase();
  const { convertAmount } = useExchangeRates();
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const { year, month } = getCurrentMonthYear();
    budgetsDb.getBudgetProgress(year, month).then((data) => {
      // Convert spent amounts from each currency to display currency
      const converted = data.map((b) => {
        const spent = (b.spentByCurrency ?? []).reduce(
          (sum, s) => sum + convertAmount(s.total, s.currency),
          0
        );
        return {
          ...b,
          amount: convertAmount(b.amount, b.currency),
          spent,
        };
      });
      converted.sort((a, b) => b.spent - a.spent);
      setBudgets(converted);
      setLoading(false);
    });
  }, [isReady, refreshKey, convertAmount]);

  return { budgets, loading };
}
