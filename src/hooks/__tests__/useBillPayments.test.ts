import { mockDatabaseContext } from './helpers';
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../db/bill-payments', () => ({
  getPaymentsForBill: jest.fn().mockResolvedValue([]),
}));

import { useBillPayments } from '../useBillPayments';
import * as billPaymentsDb from '../../db/bill-payments';

const mockGetPayments = billPaymentsDb.getPaymentsForBill as jest.MockedFunction<typeof billPaymentsDb.getPaymentsForBill>;

beforeEach(() => {
  jest.clearAllMocks();
  mockDatabaseContext.isReady = true;
  mockDatabaseContext.refreshKey = 0;
});

describe('useBillPayments', () => {
  it('fetches payments for a bill when ready', async () => {
    const mockPayments = [
      { id: 1, bill_id: 5, amount: 50, paid_date: '2026-03-13', created_at: '' },
    ];
    mockGetPayments.mockResolvedValue(mockPayments);

    const { result } = renderHook(() => useBillPayments(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.payments).toEqual(mockPayments);
    expect(mockGetPayments).toHaveBeenCalledWith(5);
  });

  it('does not fetch when billId is falsy', () => {
    renderHook(() => useBillPayments(0));

    expect(mockGetPayments).not.toHaveBeenCalled();
  });

  it('does not fetch when not ready', () => {
    mockDatabaseContext.isReady = false;

    renderHook(() => useBillPayments(1));

    expect(mockGetPayments).not.toHaveBeenCalled();
  });
});
