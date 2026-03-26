import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders label when provided', () => {
    render(<Input label="Amount" />);
    expect(screen.getByText('Amount')).toBeTruthy();
  });

  it('does not render label when not provided', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.queryByText('Amount')).toBeNull();
  });

  it('shows error message when error prop set', () => {
    render(<Input label="Amount" error="Required field" />);
    expect(screen.getByText('Required field')).toBeTruthy();
  });

  it('does not show error when not provided', () => {
    render(<Input label="Amount" />);
    expect(screen.queryByText('Required field')).toBeNull();
  });

  it('passes value and fires onChangeText', () => {
    const onChangeText = jest.fn();
    render(<Input value="100" onChangeText={onChangeText} testID="input" />);

    fireEvent.changeText(screen.getByTestId('input'), '200');
    expect(onChangeText).toHaveBeenCalledWith('200');
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter amount" testID="input" />);
    expect(screen.getByTestId('input').props.placeholder).toBe('Enter amount');
  });
});
