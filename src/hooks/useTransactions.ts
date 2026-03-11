import { useState, useEffect, useCallback } from 'react';
import { TransactionWithCategory } from '../db/types';
import * as transactionsDb from '../db/transactions';
import { useDatabase } from './useDatabase';
import { getCurrentMonthYear } from '../utils/dates';

export function useTransactions() {
  const { isReady, refreshKey } = useDatabase();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const data = await transactionsDb.getAllTransactions();
    setTransactions(data);
    setLoading(false);
  }, [isReady]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { transactions, loading, reload: load };
}

export function useMonthlyTotals() {
  const { isReady, refreshKey } = useDatabase();
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const { year, month } = getCurrentMonthYear();
    transactionsDb.getMonthlyTotals(year, month).then((data) => {
      setTotals(data);
      setLoading(false);
    });
  }, [isReady, refreshKey]);

  return { ...totals, loading };
}

export function useTotalBalance() {
  const { isReady, refreshKey } = useDatabase();
  const [balance, setBalance] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    transactionsDb.getTotalBalance().then((data) => {
      setBalance(data);
      setLoading(false);
    });
  }, [isReady, refreshKey]);

  return { ...balance, balance: balance.income - balance.expenses, loading };
}

export function useSpendingByCategory() {
  const { isReady, refreshKey } = useDatabase();
  const [spending, setSpending] = useState<Array<{
    category_id: number;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const { year, month } = getCurrentMonthYear();
    transactionsDb.getSpendingByCategory(year, month).then((data) => {
      setSpending(data);
      setLoading(false);
    });
  }, [isReady, refreshKey]);

  return { spending, loading };
}
