import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders title text', () => {
    render(<Button title="Save" onPress={jest.fn()} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('fires onPress handler', () => {
    const onPress = jest.fn();
    render(<Button title="Save" onPress={onPress} />);

    fireEvent.press(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows ActivityIndicator when loading', () => {
    render(<Button title="Save" onPress={jest.fn()} loading />);
    // When loading, title text should not be visible
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('disables press when disabled', () => {
    const onPress = jest.fn();
    render(<Button title="Save" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('disables press when loading', () => {
    const onPress = jest.fn();
    const { root } = render(<Button title="Save" onPress={onPress} loading />);

    fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders all variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Button title={`${variant}-btn`} onPress={jest.fn()} variant={variant} />
      );
      expect(screen.getByText(`${variant}-btn`)).toBeTruthy();
      unmount();
    }
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <Button title={`${size}-btn`} onPress={jest.fn()} size={size} />
      );
      expect(screen.getByText(`${size}-btn`)).toBeTruthy();
      unmount();
    }
  });
});
