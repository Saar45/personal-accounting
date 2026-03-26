import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(
      <EmptyState icon="wallet-outline" title="No Transactions" message="Add your first transaction" />
    );
    expect(screen.getByText('No Transactions')).toBeTruthy();
    expect(screen.getByText('Add your first transaction')).toBeTruthy();
  });

  it('renders icon', () => {
    render(
      <EmptyState icon="wallet-outline" title="Empty" message="Nothing here" />
    );
    expect(screen.getByText('wallet-outline')).toBeTruthy();
  });

  it('renders action button when actionLabel provided', () => {
    render(
      <EmptyState
        icon="wallet-outline"
        title="Empty"
        message="Nothing here"
        actionLabel="Add Transaction"
        onAction={jest.fn()}
      />
    );
    expect(screen.getByText('Add Transaction')).toBeTruthy();
  });

  it('fires onAction when action button pressed', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        icon="wallet-outline"
        title="Empty"
        message="Nothing here"
        actionLabel="Add Transaction"
        onAction={onAction}
      />
    );

    fireEvent.press(screen.getByText('Add Transaction'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('hides action button when no actionLabel', () => {
    render(
      <EmptyState icon="wallet-outline" title="Empty" message="Nothing here" />
    );
    expect(screen.queryByText('Add Transaction')).toBeNull();
  });
});
