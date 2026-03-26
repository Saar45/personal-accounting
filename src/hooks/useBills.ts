import { useState, useEffect, useCallback } from 'react';
import { BillWithCategory } from '../db/types';
import * as billsDb from '../db/bills';
import { useDatabase } from './useDatabase';
import { useExchangeRates } from './useExchangeRates';

export function useBills() {
  const { isReady, refreshKey } = useDatabase();
  const [bills, setBills] = useState<BillWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const data = await billsDb.getAllBills();
    setBills(data);
    setLoading(false);
  }, [isReady]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { bills, loading, reload: load };
}

export function useUpcomingBills(limit: number = 3) {
  const { isReady, refreshKey } = useDatabase();
  const [bills, setBills] = useState<BillWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    billsDb.getUpcomingBills(limit).then((data) => {
      setBills(data);
      setLoading(false);
    });
  }, [isReady, refreshKey, limit]);

  return { bills, loading };
}

export function useMonthlyBillsTotal() {
  const { isReady, refreshKey } = useDatabase();
  const { convertAmount } = useExchangeRates();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    billsDb.getMonthlyBillsTotal().then((rows) => {
      const converted = rows.reduce(
        (sum, r) => sum + convertAmount(r.total, r.currency),
        0
      );
      setTotal(converted);
      setLoading(false);
    });
  }, [isReady, refreshKey, convertAmount]);

  return { total, loading };
}
