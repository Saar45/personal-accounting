import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../db/bills', () => ({
  getAllBills: jest.fn().mockResolvedValue([]),
  getUpcomingBills: jest.fn().mockResolvedValue([]),
  getMonthlyBillsTotal: jest.fn().mockResolvedValue(0),
}));

import { useBills, useUpcomingBills, useMonthlyBillsTotal } from '../useBills';
import * as billsDb from '../../db/bills';

const mockGetAll = billsDb.getAllBills as jest.MockedFunction<typeof billsDb.getAllBills>;
const mockGetUpcoming = billsDb.getUpcomingBills as jest.MockedFunction<typeof billsDb.getUpcomingBills>;
const mockGetTotal = billsDb.getMonthlyBillsTotal as jest.MockedFunction<typeof billsDb.getMonthlyBillsTotal>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useBills', () => {
  it('fetches bills when ready', async () => {
    const mockBills = [
      { id: 1, name: 'Rent', amount: 800, category_id: 1, frequency: 'monthly' as const,
        due_day: 1, next_due_date: '2026-04-01', is_active: 1, created_at: '',
        category_name: 'Housing', category_icon: 'home-outline', category_color: '#6C5CE7' },
    ];
    mockGetAll.mockResolvedValue(mockBills);

    const { result } = renderHook(() => useBills());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bills).toEqual(mockBills);
  });
});

describe('useUpcomingBills', () => {
  it('passes limit parameter', async () => {
    const { result } = renderHook(() => useUpcomingBills(5));

    await waitFor(() => {
      expect(mockGetUpcoming).toHaveBeenCalledWith(5);
    });
  });
});

describe('useMonthlyBillsTotal', () => {
  it('returns total', async () => {
    mockGetTotal.mockResolvedValue(350);

    const { result } = renderHook(() => useMonthlyBillsTotal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.total).toBe(350);
  });
});
