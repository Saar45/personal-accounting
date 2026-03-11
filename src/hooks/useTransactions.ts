import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useFilteredTransactions() {
  const { isReady, refreshKey } = useDatabase();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const load = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);

    const hasFilters = debouncedQuery || typeFilter !== 'all' || categoryFilter !== null;

    if (hasFilters) {
      const data = await transactionsDb.searchTransactions({
        query: debouncedQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        categoryId: categoryFilter ?? undefined,
      });
      setTransactions(data);
    } else {
      const data = await transactionsDb.getAllTransactions();
      setTransactions(data);
    }

    setLoading(false);
  }, [isReady, debouncedQuery, typeFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return {
    transactions,
    loading,
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
  };
}
