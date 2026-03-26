import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TransactionFilters } from '../TransactionFilters';
import { mockCategory } from './helpers';

describe('TransactionFilters', () => {
  const defaultProps = {
    selectedType: 'all' as const,
    onTypeChange: jest.fn(),
    categories: [
      mockCategory({ id: 1, name: 'Food' }),
      mockCategory({ id: 2, name: 'Transport' }),
    ],
    selectedCategoryId: null,
    onCategoryChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders type filter chips', () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Expenses')).toBeTruthy();
    expect(screen.getByText('Income')).toBeTruthy();
  });

  it('calls onTypeChange when type chip pressed', () => {
    render(<TransactionFilters {...defaultProps} />);

    fireEvent.press(screen.getByText('Expenses'));
    expect(defaultProps.onTypeChange).toHaveBeenCalledWith('expense');
  });

  it('renders category chips', () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Transport')).toBeTruthy();
  });

  it('calls onCategoryChange when category chip pressed', () => {
    render(<TransactionFilters {...defaultProps} />);

    fireEvent.press(screen.getByText('Food'));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(1);
  });

  it('deselects category when same chip pressed again', () => {
    render(<TransactionFilters {...defaultProps} selectedCategoryId={1} />);

    fireEvent.press(screen.getByText('Food'));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(null);
  });
});
