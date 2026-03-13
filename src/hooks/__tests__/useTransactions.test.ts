import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor, act } from '@testing-library/react-native';

jest.mock('../../db/transactions', () => ({
  getAllTransactions: jest.fn().mockResolvedValue([]),
  getMonthlyTotals: jest.fn().mockResolvedValue({ income: 0, expenses: 0 }),
  getTotalBalance: jest.fn().mockResolvedValue({ income: 0, expenses: 0 }),
  getSpendingByCategory: jest.fn().mockResolvedValue([]),
  searchTransactions: jest.fn().mockResolvedValue([]),
}));

import { useTransactions, useMonthlyTotals, useTotalBalance } from '../useTransactions';
import * as transactionsDb from '../../db/transactions';

const mockGetAll = transactionsDb.getAllTransactions as jest.MockedFunction<typeof transactionsDb.getAllTransactions>;
const mockGetTotals = transactionsDb.getMonthlyTotals as jest.MockedFunction<typeof transactionsDb.getMonthlyTotals>;
const mockGetBalance = transactionsDb.getTotalBalance as jest.MockedFunction<typeof transactionsDb.getTotalBalance>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useTransactions', () => {
  it('fetches transactions when ready', async () => {
    const mockTx = [
      { id: 1, amount: 50, type: 'expense' as const, category_id: 1, date: '2026-03-13',
        description: 'Test', created_at: '', category_name: 'Food',
        category_icon: 'icon', category_color: '#000' },
    ];
    mockGetAll.mockResolvedValue(mockTx);

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTx);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('does not fetch when not ready', () => {
    mockDatabaseContext.isReady = false;

    renderHook(() => useTransactions());

    expect(mockGetAll).not.toHaveBeenCalled();
  });
});

describe('useMonthlyTotals', () => {
  it('returns monthly totals', async () => {
    mockGetTotals.mockResolvedValue({ income: 3000, expenses: 500 });

    const { result } = renderHook(() => useMonthlyTotals());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.income).toBe(3000);
    expect(result.current.expenses).toBe(500);
  });
});

describe('useTotalBalance', () => {
  it('computes balance from income and expenses', async () => {
    mockGetBalance.mockResolvedValue({ income: 5000, expenses: 2000 });

    const { result } = renderHook(() => useTotalBalance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.balance).toBe(3000);
    expect(result.current.income).toBe(5000);
    expect(result.current.expenses).toBe(2000);
  });
});
