import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

const mockGetItem = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSetItem = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;

import { CurrencyProvider, useCurrency, CURRENCY_STORE_KEY } from '../useCurrency';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CurrencyProvider>{children}</CurrencyProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
});

describe('useCurrency', () => {
  it('defaults to EUR when no saved preference', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });

    expect(result.current.currency).toBe('EUR');
  });

  it('loads saved currency from SecureStore', async () => {
    mockGetItem.mockResolvedValue('USD');

    const { result } = renderHook(() => useCurrency(), { wrapper });

    await waitFor(() => {
      expect(result.current.currency).toBe('USD');
    });
  });

  it('ignores invalid saved currency', async () => {
    mockGetItem.mockResolvedValue('INVALID');

    const { result } = renderHook(() => useCurrency(), { wrapper });

    // Should stay EUR since INVALID is not a supported currency
    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith(CURRENCY_STORE_KEY);
    });
    expect(result.current.currency).toBe('EUR');
  });

  it('setCurrency updates state and persists', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });

    await act(async () => {
      await result.current.setCurrency('GBP');
    });

    expect(result.current.currency).toBe('GBP');
    expect(mockSetItem).toHaveBeenCalledWith(CURRENCY_STORE_KEY, 'GBP');
  });

  it('provides formatAmount function', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });

    expect(typeof result.current.formatAmount).toBe('function');
    expect(typeof result.current.formatCompact).toBe('function');
    expect(typeof result.current.formatSigned).toBe('function');
  });

  it('provides currencies list', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });

    expect(result.current.currencies.length).toBeGreaterThan(0);
    expect(result.current.currencies[0].code).toBe('EUR');
  });
});
