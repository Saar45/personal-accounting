import { useState, useEffect, useCallback } from 'react';
import { Account } from '../db/types';
import * as accountsDb from '../db/accounts';
import { useDatabase } from './useDatabase';

export function useAccounts() {
  const { isReady, refreshKey } = useDatabase();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    const data = await accountsDb.getAllAccounts();
    setAccounts(data);
    setLoading(false);
  }, [isReady]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { accounts, loading, reload: load };
}

export function useAccountBalance(id: number | undefined) {
  const { isReady, refreshKey } = useDatabase();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || id === undefined) return;
    setLoading(true);
    accountsDb.getAccountBalance(id).then((b) => {
      setBalance(b);
      setLoading(false);
    });
  }, [isReady, refreshKey, id]);

  return { balance, loading };
}
