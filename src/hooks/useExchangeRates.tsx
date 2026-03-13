import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import { useCurrency } from './useCurrency';
import { useDatabase } from './useDatabase';
import { RateMap, refreshRatesIfNeeded, loadCachedRates, convert, fetchRatesFromAPI, buildRateMap } from '../utils/exchangeRates';
import { saveRates, getRateAge } from '../db/exchange-rates';

interface ExchangeRatesContextType {
  convertAmount: (amount: number, fromCurrency: string) => number;
  ratesLoaded: boolean;
  rateDate: string | null;
  refreshRates: () => Promise<void>;
  lastRefresh: Date | null;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextType>({
  convertAmount: (amount) => amount,
  ratesLoaded: false,
  rateDate: null,
  refreshRates: async () => {},
  lastRefresh: null,
});

export function ExchangeRatesProvider({ children }: { children: React.ReactNode }) {
  const { currency } = useCurrency();
  const { isReady } = useDatabase();
  const [rateMap, setRateMap] = useState<RateMap>(new Map());
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const appState = useRef(AppState.currentState);

  const loadRates = useCallback(async () => {
    if (!isReady) return;
    const map = await refreshRatesIfNeeded(currency);
    setRateMap(map);
    setRatesLoaded(true);
    setLastRefresh(new Date());
  }, [currency, isReady]);

  // Initial load + reload when currency changes
  useEffect(() => {
    loadRates();
  }, [loadRates]);

  // Refresh on foreground if stale
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const age = await getRateAge(currency);
        if (age === null || age > 12) {
          loadRates();
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [loadRates]);

  const refreshRates = useCallback(async () => {
    const result = await fetchRatesFromAPI(currency);
    if (result) {
      result.rates[currency] = 1;
      await saveRates(currency, result.date, result.rates);
      setRateMap(buildRateMap(currency, result.rates));
      setRateDate(result.date);
      setLastRefresh(new Date());
    }
  }, [currency]);

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string) => {
      return convert(amount, fromCurrency, currency, rateMap);
    },
    [currency, rateMap]
  );

  const value = useMemo<ExchangeRatesContextType>(
    () => ({ convertAmount, ratesLoaded, rateDate, refreshRates, lastRefresh }),
    [convertAmount, ratesLoaded, rateDate, refreshRates, lastRefresh]
  );

  return (
    <ExchangeRatesContext.Provider value={value}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

export function useExchangeRates() {
  return useContext(ExchangeRatesContext);
}
