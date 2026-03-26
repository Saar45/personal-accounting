import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { mockFormatAmount, mockBudgetWithProgress } from '../../__tests__/helpers';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatAmount: mockFormatAmount,
  }),
}));

jest.mock('../../../hooks/useBudgets', () => ({
  useBudgetProgress: jest.fn(),
}));

import { BudgetOverview } from '../BudgetOverview';
import * as budgetsHooks from '../../../hooks/useBudgets';

const mockUseBudgetProgress = budgetsHooks.useBudgetProgress as jest.MockedFunction<typeof budgetsHooks.useBudgetProgress>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BudgetOverview', () => {
  it('renders budget items with category names', () => {
    mockUseBudgetProgress.mockReturnValue({
      budgets: [
        mockBudgetWithProgress({ id: 1, category_name: 'Food', spent: 200, amount: 500 }),
        mockBudgetWithProgress({ id: 2, category_name: 'Transport', spent: 100, amount: 300 }),
      ],
      loading: false,
    });

    render(<BudgetOverview />);
    expect(screen.getByText('Budget Overview')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
  });

  it('shows empty message when no budgets', () => {
    mockUseBudgetProgress.mockReturnValue({ budgets: [], loading: false });

    render(<BudgetOverview />);
    expect(screen.getByText('No budgets set')).toBeTruthy();
  });

  it('shows View All link when budgets exist', () => {
    mockUseBudgetProgress.mockReturnValue({
      budgets: [mockBudgetWithProgress()],
      loading: false,
    });

    render(<BudgetOverview />);
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('navigates to budgets on View All press', () => {
    mockUseBudgetProgress.mockReturnValue({
      budgets: [mockBudgetWithProgress()],
      loading: false,
    });

    render(<BudgetOverview />);
    fireEvent.press(screen.getByText('View All'));
    expect(mockPush).toHaveBeenCalledWith('/budgets');
  });

  it('hides View All when no budgets', () => {
    mockUseBudgetProgress.mockReturnValue({ budgets: [], loading: false });

    render(<BudgetOverview />);
    expect(screen.queryByText('View All')).toBeNull();
  });

  it('limits display to 3 budgets', () => {
    mockUseBudgetProgress.mockReturnValue({
      budgets: [
        mockBudgetWithProgress({ id: 1, category_name: 'Food' }),
        mockBudgetWithProgress({ id: 2, category_name: 'Transport' }),
        mockBudgetWithProgress({ id: 3, category_name: 'Entertainment' }),
        mockBudgetWithProgress({ id: 4, category_name: 'Shopping' }),
      ],
      loading: false,
    });

    render(<BudgetOverview />);
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
    expect(screen.getByText('Entertainment')).toBeTruthy();
    expect(screen.queryByText('Shopping')).toBeNull();
  });
});
