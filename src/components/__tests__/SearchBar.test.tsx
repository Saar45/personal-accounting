import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar value="" onChangeText={jest.fn()} placeholder="Search transactions..." />);
    // The search icon mock renders as text
    expect(screen.getByText('search-outline')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    render(<SearchBar value="" onChangeText={onChangeText} />);

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'groceries');
    expect(onChangeText).toHaveBeenCalledWith('groceries');
  });

  it('shows clear button when value is non-empty', () => {
    render(<SearchBar value="test" onChangeText={jest.fn()} />);
    expect(screen.getByText('close-circle')).toBeTruthy();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" onChangeText={jest.fn()} />);
    expect(screen.queryByText('close-circle')).toBeNull();
  });

  it('clears text when clear button pressed', () => {
    const onChangeText = jest.fn();
    render(<SearchBar value="test" onChangeText={onChangeText} />);

    fireEvent.press(screen.getByText('close-circle'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
