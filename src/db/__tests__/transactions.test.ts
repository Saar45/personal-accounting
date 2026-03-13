import { createMockDb } from './helpers';

const mockDb = createMockDb();

jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

import {
  createTransaction,
  getTransactionsByMonth,
  getMonthlyTotals,
  getTotalBalance,
  searchTransactions,
  bulkCreateTransactions,
  deleteTransaction,
} from '../transactions';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.getFirstAsync.mockResolvedValue(null);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
  mockDb.withExclusiveTransactionAsync.mockImplementation(async (cb: (txn: any) => Promise<void>) => {
    const txn = { runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }) };
    await cb(txn);
    return txn;
  });
});

describe('createTransaction', () => {
  it('inserts with correct params', async () => {
    const id = await createTransaction({
      amount: 50,
      type: 'expense',
      category_id: 1,
      description: 'Test',
      date: '2026-03-13',
    });

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO transactions'),
      50, 'expense', 1, 'Test', '2026-03-13', 'EUR'
    );
  });

  it('passes null for missing description', async () => {
    await createTransaction({
      amount: 100,
      type: 'income',
      category_id: 2,
      date: '2026-03-13',
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.any(String),
      100, 'income', 2, null, '2026-03-13', 'EUR'
    );
  });
});

describe('getTransactionsByMonth', () => {
  it('passes correct date range for March', async () => {
    await getTransactionsByMonth(2026, 3);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE t.date >= ? AND t.date < ?'),
      '2026-03-01', '2026-04-01'
    );
  });

  it('handles December rollover', async () => {
    await getTransactionsByMonth(2026, 12);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      '2026-12-01', '2027-01-01'
    );
  });
});

describe('getMonthlyTotals', () => {
  it('returns empty array when no data', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const result = await getMonthlyTotals(2026, 3);
    expect(result).toEqual([]);
  });

  it('returns rows grouped by type and currency', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { type: 'income', currency: 'EUR', total: 3000 },
      { type: 'expense', currency: 'EUR', total: 500 },
    ]);
    const result = await getMonthlyTotals(2026, 3);
    expect(result).toEqual([
      { type: 'income', currency: 'EUR', total: 3000 },
      { type: 'expense', currency: 'EUR', total: 500 },
    ]);
  });
});

describe('getTotalBalance', () => {
  it('returns empty array when no data', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const result = await getTotalBalance();
    expect(result).toEqual([]);
  });
});

describe('searchTransactions', () => {
  it('builds WHERE clause for query', async () => {
    await searchTransactions({ query: 'test' });

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('description LIKE'),
      '%test%'
    );
  });

  it('builds WHERE clause for type filter', async () => {
    await searchTransactions({ type: 'expense' });

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('t.type = ?'),
      'expense'
    );
  });

  it('combines multiple filters', async () => {
    await searchTransactions({ query: 'food', type: 'expense', categoryId: 1 });

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('AND'),
      '%food%', 'expense', 1
    );
  });

  it('returns all with no filters', async () => {
    await searchTransactions({});

    const sql = mockDb.getAllAsync.mock.calls[0][0];
    expect(sql).not.toContain('WHERE');
  });
});

describe('bulkCreateTransactions', () => {
  it('uses exclusive transaction', async () => {
    await bulkCreateTransactions([
      { amount: 10, type: 'expense', category_id: 1, date: '2026-01-01' },
      { amount: 20, type: 'income', category_id: 2, date: '2026-01-02' },
    ]);

    expect(mockDb.withExclusiveTransactionAsync).toHaveBeenCalledTimes(1);
  });
});

describe('deleteTransaction', () => {
  it('deletes by id', async () => {
    await deleteTransaction(5);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM transactions'),
      5
    );
  });
});
