import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { mockTransaction, mockFormatAmount } from './helpers';

jest.mock('../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatAmount: mockFormatAmount,
  }),
}));

jest.mock('../../utils/dates', () => ({
  formatDate: jest.fn((d: string) => d),
}));

import { TransactionItem } from '../TransactionItem';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransactionItem', () => {
  it('renders description', () => {
    const tx = mockTransaction({ description: 'Grocery store' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    expect(screen.getByText('Grocery store')).toBeTruthy();
  });

  it('renders category name when no description', () => {
    const tx = mockTransaction({ description: '', category_name: 'Food' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    expect(screen.getByText('Food')).toBeTruthy();
  });

  it('renders formatted amount for expense', () => {
    const tx = mockTransaction({ amount: 50, type: 'expense' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    expect(mockFormatAmount).toHaveBeenCalledWith(50);
  });

  it('shows + prefix for income', () => {
    const tx = mockTransaction({ amount: 3000, type: 'income' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    // The rendered text should contain the + prefix
    expect(screen.getByText(/\+/)).toBeTruthy();
  });

  it('shows - prefix for expense', () => {
    const tx = mockTransaction({ amount: 50, type: 'expense' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    expect(screen.getByText(/^-€/)).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const tx = mockTransaction();
    render(<TransactionItem transaction={tx} onPress={onPress} />);

    fireEvent.press(screen.getByText('Grocery store'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders category icon via Badge', () => {
    const tx = mockTransaction({ category_icon: 'restaurant-outline' });
    render(<TransactionItem transaction={tx} onPress={jest.fn()} />);
    // Ionicons mock renders name as text
    expect(screen.getByText('restaurant-outline')).toBeTruthy();
  });
});
