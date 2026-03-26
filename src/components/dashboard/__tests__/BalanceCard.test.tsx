import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { mockFormatAmount } from '../../__tests__/helpers';

jest.mock('../../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatAmount: mockFormatAmount,
  }),
}));

jest.mock('../../../hooks/useTransactions', () => ({
  useTotalBalance: jest.fn(),
  useMonthlyTotals: jest.fn(),
}));

import { BalanceCard } from '../BalanceCard';
import * as transactionsHooks from '../../../hooks/useTransactions';

const mockUseTotalBalance = transactionsHooks.useTotalBalance as jest.MockedFunction<typeof transactionsHooks.useTotalBalance>;
const mockUseMonthlyTotals = transactionsHooks.useMonthlyTotals as jest.MockedFunction<typeof transactionsHooks.useMonthlyTotals>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseTotalBalance.mockReturnValue({ balance: 5000, income: 8000, expenses: 3000, loading: false });
  mockUseMonthlyTotals.mockReturnValue({ income: 3000, expenses: 500, loading: false });
});

describe('BalanceCard', () => {
  it('renders total balance', () => {
    render(<BalanceCard />);
    expect(screen.getByText('Total Balance')).toBeTruthy();
    expect(mockFormatAmount).toHaveBeenCalledWith(5000);
  });

  it('renders monthly income and expenses', () => {
    render(<BalanceCard />);
    expect(screen.getByText('Income')).toBeTruthy();
    expect(screen.getByText('Expenses')).toBeTruthy();
    expect(mockFormatAmount).toHaveBeenCalledWith(3000);
    expect(mockFormatAmount).toHaveBeenCalledWith(500);
  });

  it('shows loading placeholder when balance loading', () => {
    mockUseTotalBalance.mockReturnValue({ balance: 0, income: 0, expenses: 0, loading: true });
    mockUseMonthlyTotals.mockReturnValue({ income: 0, expenses: 0, loading: true });

    render(<BalanceCard />);
    expect(screen.getAllByText('---').length).toBeGreaterThanOrEqual(1);
  });
});
