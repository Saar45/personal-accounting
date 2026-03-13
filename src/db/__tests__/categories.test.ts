import { createMockDb } from './helpers';

const mockDb = createMockDb();
jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

import {
  createCategory,
  deleteCategory,
  canDeleteCategory,
  getCategoriesByType,
} from '../categories';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.getFirstAsync.mockResolvedValue(null);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
});

describe('createCategory', () => {
  it('inserts with is_default=0', async () => {
    await createCategory({
      name: 'Custom',
      icon: 'star-outline',
      color: '#FF0000',
      type: 'expense',
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('is_default) VALUES (?, ?, ?, ?, 0)'),
      'Custom', 'star-outline', '#FF0000', 'expense'
    );
  });
});

describe('deleteCategory', () => {
  it('only deletes non-default categories', async () => {
    await deleteCategory(5);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('is_default = 0'),
      5
    );
  });
});

describe('canDeleteCategory', () => {
  it('returns canDelete true when no references', async () => {
    mockDb.getFirstAsync
      .mockResolvedValueOnce({ count: 0 })  // transactions
      .mockResolvedValueOnce({ count: 0 }); // bills

    const result = await canDeleteCategory(5);
    expect(result).toEqual({ canDelete: true, transactionCount: 0, billCount: 0 });
  });

  it('returns canDelete false when transactions reference it', async () => {
    mockDb.getFirstAsync
      .mockResolvedValueOnce({ count: 3 })
      .mockResolvedValueOnce({ count: 0 });

    const result = await canDeleteCategory(5);
    expect(result).toEqual({ canDelete: false, transactionCount: 3, billCount: 0 });
  });
});

describe('getCategoriesByType', () => {
  it('filters by type', async () => {
    await getCategoriesByType('income');
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE type = ?'),
      'income'
    );
  });
});
