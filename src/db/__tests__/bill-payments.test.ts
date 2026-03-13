import { createMockDb } from './helpers';

const mockDb = createMockDb();
jest.mock('../database', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

import { getPaymentsForBill, createBillPayment, deleteBillPayment } from '../bill-payments';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
});

describe('getPaymentsForBill', () => {
  it('queries by bill_id ordered by paid_date DESC', async () => {
    await getPaymentsForBill(5);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE bill_id = ?'),
      5
    );
  });
});

describe('createBillPayment', () => {
  it('inserts with correct params', async () => {
    const id = await createBillPayment({
      bill_id: 1,
      amount: 50,
      paid_date: '2026-03-13',
    });

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bill_payments'),
      1, 50, '2026-03-13', 'EUR'
    );
  });
});

describe('deleteBillPayment', () => {
  it('deletes by id', async () => {
    await deleteBillPayment(3);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM bill_payments'),
      3
    );
  });
});
