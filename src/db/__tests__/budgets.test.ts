import { createMockDb } from './helpers';

const mockDb = createMockDb();
jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

import { createBudget, deleteBudget, getBudgetProgress } from '../budgets';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
});

describe('createBudget', () => {
  it('inserts with correct params', async () => {
    await createBudget({ category_id: 1, amount: 500, period: 'monthly' });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO budgets'),
      1, 500, 'monthly'
    );
  });
});

describe('deleteBudget', () => {
  it('deletes by id', async () => {
    await deleteBudget(3);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM budgets'),
      3
    );
  });
});

describe('getBudgetProgress', () => {
  it('passes correct month range for March', async () => {
    await getBudgetProgress(2026, 3);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      '2026-03-01', '2026-04-01'
    );
  });

  it('handles December rollover', async () => {
    await getBudgetProgress(2026, 12);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      '2026-12-01', '2027-01-01'
    );
  });
});
