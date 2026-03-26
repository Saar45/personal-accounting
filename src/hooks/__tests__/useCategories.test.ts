import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../db/categories', () => ({
  getAllCategories: jest.fn().mockResolvedValue([]),
}));

import { useCategories } from '../useCategories';
import * as categoriesDb from '../../db/categories';

const mockGetAll = categoriesDb.getAllCategories as jest.MockedFunction<typeof categoriesDb.getAllCategories>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useCategories', () => {
  it('fetches categories when ready', async () => {
    const mockCategories = [
      { id: 1, name: 'Food', icon: 'restaurant-outline', color: '#FF6B6B', type: 'expense' as const, is_default: 1 },
      { id: 2, name: 'Salary', icon: 'wallet-outline', color: '#00B894', type: 'income' as const, is_default: 1 },
    ];
    mockGetAll.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(mockGetAll).toHaveBeenCalled();
  });

  it('does not fetch when not ready', () => {
    mockDatabaseContext.isReady = false;

    renderHook(() => useCategories());

    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it('refetches when refreshKey changes', async () => {
    mockGetAll.mockResolvedValue([]);

    const { result, rerender } = renderHook(() => useCategories());

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
