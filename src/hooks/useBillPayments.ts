import { useState, useEffect, useCallback } from 'react';
import { BillPayment } from '../db/types';
import * as billPaymentsDb from '../db/bill-payments';
import { useDatabase } from './useDatabase';

export function useBillPayments(billId: number) {
  const { isReady, refreshKey } = useDatabase();
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isReady || !billId) return;
    setLoading(true);
    const data = await billPaymentsDb.getPaymentsForBill(billId);
    setPayments(data);
    setLoading(false);
  }, [isReady, billId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { payments, loading, reload: load };
}
