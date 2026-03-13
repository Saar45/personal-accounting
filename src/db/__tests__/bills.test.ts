import { createMockDb } from './helpers';

const mockDb = createMockDb();
jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

jest.mock('../../utils/dates', () => ({
  computeNextDueDate: jest.fn().mockReturnValue('2026-04-15'),
}));

import {
  createBill,
  getBillById,
  toggleBillActive,
  deleteBill,
  getMonthlyBillsTotal,
  refreshBillDueDates,
  getActiveBills,
} from '../bills';
import { computeNextDueDate } from '../../utils/dates';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.getFirstAsync.mockResolvedValue(null);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
});

describe('createBill', () => {
  it('inserts with correct params', async () => {
    const id = await createBill({
      name: 'Rent',
      amount: 800,
      category_id: 1,
      frequency: 'monthly',
      due_day: 1,
      next_due_date: '2026-04-01',
    });

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bills'),
      'Rent', 800, 1, 'monthly', 1, '2026-04-01'
    );
  });
});

describe('toggleBillActive', () => {
  it('toggles with CASE expression', async () => {
    await toggleBillActive(3);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('CASE WHEN is_active = 1 THEN 0 ELSE 1 END'),
      3
    );
  });
});

describe('deleteBill', () => {
  it('deletes by id', async () => {
    await deleteBill(5);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM bills'),
      5
    );
  });
});

describe('getMonthlyBillsTotal', () => {
  it('returns 0 when no bills', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ total: null });
    const total = await getMonthlyBillsTotal();
    expect(total).toBe(0);
  });

  it('returns total from query', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ total: 250.5 });
    const total = await getMonthlyBillsTotal();
    expect(total).toBe(250.5);
  });
});

describe('getActiveBills', () => {
  it('queries only active bills', async () => {
    await getActiveBills();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('is_active = 1')
    );
  });
});

describe('refreshBillDueDates', () => {
  it('updates overdue bills with next due date', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 1, frequency: 'monthly', due_day: 15, is_active: 1, next_due_date: '2026-03-01' },
    ]);

    await refreshBillDueDates();

    expect(computeNextDueDate).toHaveBeenCalledWith('monthly', 15);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE bills SET next_due_date'),
      '2026-04-15',
      1
    );
  });

  it('does nothing when no overdue bills', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    await refreshBillDueDates();
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });
});
