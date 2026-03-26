import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { mockFormatAmount } from '../../__tests__/helpers';

jest.mock('../../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatAmount: mockFormatAmount,
  }),
}));

jest.mock('../../../hooks/useTransactions', () => ({
  useSpendingByCategory: jest.fn(),
}));

import { SpendingBreakdown } from '../SpendingBreakdown';
import * as transactionsHooks from '../../../hooks/useTransactions';

const mockUseSpending = transactionsHooks.useSpendingByCategory as jest.MockedFunction<typeof transactionsHooks.useSpendingByCategory>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SpendingBreakdown', () => {
  it('renders category spending items', () => {
    mockUseSpending.mockReturnValue({
      spending: [
        { category_id: 1, category_name: 'Food', category_icon: 'restaurant-outline', category_color: '#FF6B6B', total: 300 },
        { category_id: 2, category_name: 'Transport', category_icon: 'car-outline', category_color: '#74B9FF', total: 150 },
      ],
      loading: false,
    });

    render(<SpendingBreakdown />);
    expect(screen.getByText('Spending Breakdown')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
  });

  it('formats amounts correctly', () => {
    mockUseSpending.mockReturnValue({
      spending: [
        { category_id: 1, category_name: 'Food', category_icon: 'restaurant-outline', category_color: '#FF6B6B', total: 300 },
      ],
      loading: false,
    });

    render(<SpendingBreakdown />);
    expect(mockFormatAmount).toHaveBeenCalledWith(300);
  });

  it('returns null when no spending and not loading', () => {
    mockUseSpending.mockReturnValue({ spending: [], loading: false });

    const { toJSON } = render(<SpendingBreakdown />);
    expect(toJSON()).toBeNull();
  });
});
