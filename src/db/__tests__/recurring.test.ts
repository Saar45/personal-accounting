import { createMockDb } from './helpers';

const mockDb = createMockDb();
jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

jest.mock('../transactions', () => ({
  createTransaction: jest.fn().mockResolvedValue(1),
}));

jest.mock('../../utils/dates', () => ({
  getTodayISO: jest.fn().mockReturnValue('2026-03-13'),
}));

import {
  createRecurring,
  deleteRecurring,
  processRecurringTransactions,
} from '../recurring';
import { createTransaction } from '../transactions';

const mockCreateTx = createTransaction as jest.MockedFunction<typeof createTransaction>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
});

describe('createRecurring', () => {
  it('inserts with correct params', async () => {
    const id = await createRecurring({
      amount: 100,
      type: 'expense',
      category_id: 1,
      description: 'Monthly sub',
      frequency: 'monthly',
      next_occurrence: '2026-04-01',
    });

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO recurring_transactions'),
      100, 'expense', 1, 'Monthly sub', 'monthly', '2026-04-01'
    );
  });
});

describe('deleteRecurring', () => {
  it('deletes by id', async () => {
    await deleteRecurring(3);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM recurring_transactions'),
      3
    );
  });
});

describe('processRecurringTransactions', () => {
  it('creates transactions for due recurring entries', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 1, amount: 50, type: 'expense', category_id: 1,
        description: 'Netflix', frequency: 'monthly',
        next_occurrence: '2026-03-13', is_active: 1,
        category_name: 'Subscriptions', category_icon: 'refresh-outline', category_color: '#74B9FF',
      },
    ]);

    const count = await processRecurringTransactions();

    expect(count).toBe(1);
    expect(mockCreateTx).toHaveBeenCalledWith({
      amount: 50,
      type: 'expense',
      category_id: 1,
      description: 'Netflix',
      date: '2026-03-13',
    });
  });

  it('advances next_occurrence after creating transaction', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 1, amount: 50, type: 'expense', category_id: 1,
        description: 'Test', frequency: 'monthly',
        next_occurrence: '2026-03-13', is_active: 1,
        category_name: 'Test', category_icon: 'test', category_color: '#000',
      },
    ]);

    await processRecurringTransactions();

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE recurring_transactions SET next_occurrence'),
      '2026-04-13', // monthly advance
      1
    );
  });

  it('returns 0 when no due recurring', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const count = await processRecurringTransactions();
    expect(count).toBe(0);
  });
});
