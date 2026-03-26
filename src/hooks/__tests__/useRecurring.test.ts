import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../db/recurring', () => ({
  getAllRecurring: jest.fn().mockResolvedValue([]),
}));

import { useRecurringTransactions } from '../useRecurring';
import * as recurringDb from '../../db/recurring';

const mockGetAll = recurringDb.getAllRecurring as jest.MockedFunction<typeof recurringDb.getAllRecurring>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useRecurringTransactions', () => {
  it('fetches recurring transactions when ready', async () => {
    const mockRecurring = [
      {
        id: 1, amount: 100, type: 'expense' as const, category_id: 1,
        description: 'Netflix', frequency: 'monthly' as const,
        next_occurrence: '2026-04-01', is_active: 1, created_at: '',
        category_name: 'Subscriptions', category_icon: 'refresh-outline',
        category_color: '#74B9FF',
      },
    ];
    mockGetAll.mockResolvedValue(mockRecurring);

    const { result } = renderHook(() => useRecurringTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recurring).toEqual(mockRecurring);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('does not fetch when not ready', () => {
    mockDatabaseContext.isReady = false;

    renderHook(() => useRecurringTransactions());

    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it('refetches when refreshKey changes', async () => {
    mockGetAll.mockResolvedValue([]);

    const { result, rerender } = renderHook(() => useRecurringTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).toHaveBeenCalledTimes(1);

    mockDatabaseContext.refreshKey = 1;
    rerender({});

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledTimes(2);
    });
  });
});
