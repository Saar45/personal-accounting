import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../db/budgets', () => ({
  getBudgetProgress: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../utils/dates', () => ({
  getCurrentMonthYear: jest.fn().mockReturnValue({ year: 2026, month: 3 }),
}));

import { useBudgetProgress } from '../useBudgets';
import * as budgetsDb from '../../db/budgets';

const mockGetProgress = budgetsDb.getBudgetProgress as jest.MockedFunction<typeof budgetsDb.getBudgetProgress>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useBudgetProgress', () => {
  it('fetches budget progress when ready', async () => {
    const mockBudgets = [
      {
        id: 1, category_id: 1, amount: 500, period: 'monthly' as const,
        created_at: '', category_name: 'Food', category_icon: 'restaurant-outline',
        category_color: '#FF6B6B', spent: 200,
      },
    ];
    mockGetProgress.mockResolvedValue(mockBudgets);

    const { result } = renderHook(() => useBudgetProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.budgets).toEqual(mockBudgets);
    expect(mockGetProgress).toHaveBeenCalledWith(2026, 3);
  });

  it('does not fetch when not ready', () => {
    mockDatabaseContext.isReady = false;

    renderHook(() => useBudgetProgress());

    expect(mockGetProgress).not.toHaveBeenCalled();
  });
});
