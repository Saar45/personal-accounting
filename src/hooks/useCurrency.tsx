import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { createFormatters, SUPPORTED_CURRENCIES, SupportedCurrency } from '../utils/currency';

export const CURRENCY_STORE_KEY = 'base_currency';
const DEFAULT_CURRENCY = 'EUR';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => Promise<void>;
  formatAmount: (amount: number) => string;
  formatCompact: (amount: number) => string;
  formatSigned: (amount: number, type: 'income' | 'expense') => string;
  currencies: SupportedCurrency[];
}

const defaultFormatters = createFormatters(DEFAULT_CURRENCY);
const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: async () => {},
  formatAmount: defaultFormatters.format,
  formatCompact: defaultFormatters.formatCompact,
  formatSigned: defaultFormatters.formatSigned,
  currencies: SUPPORTED_CURRENCIES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    async function load() {
      const saved = await SecureStore.getItemAsync(CURRENCY_STORE_KEY);
      if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
        setCurrencyState(saved);
      }
    }
    load();
  }, []);

  const setCurrency = useCallback(async (code: string) => {
    setCurrencyState(code);
    await SecureStore.setItemAsync(CURRENCY_STORE_KEY, code).catch(() => {});
  }, []);

  const formatters = useMemo(() => createFormatters(currency), [currency]);

  const value = useMemo<CurrencyContextType>(() => ({
    currency,
    setCurrency,
    formatAmount: formatters.format,
    formatCompact: formatters.formatCompact,
    formatSigned: formatters.formatSigned,
    currencies: SUPPORTED_CURRENCIES,
  }), [currency, setCurrency, formatters]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
