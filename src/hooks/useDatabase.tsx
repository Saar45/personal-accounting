import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDatabase } from '../db/database';
import { refreshBillDueDates } from '../db/bills';
import { processRecurringTransactions } from '../db/recurring';
import { rescheduleNotificationsIfEnabled } from '../utils/notifications';

interface DatabaseContextType {
  isReady: boolean;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function init() {
      await getDatabase();
      await refreshBillDueDates();
      await processRecurringTransactions();
      await rescheduleNotificationsIfEnabled();
      setIsReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    rescheduleNotificationsIfEnabled().catch(() => {});
  }, [refreshKey, isReady]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, refreshKey, triggerRefresh }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
