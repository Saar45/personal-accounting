import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DatePickerField } from '../DatePickerField';

describe('DatePickerField', () => {
  it('renders label when provided', () => {
    render(<DatePickerField label="Date" value="2026-03-13" onChange={jest.fn()} />);
    expect(screen.getByText('Date')).toBeTruthy();
  });

  it('displays formatted date value', () => {
    render(<DatePickerField value="2026-03-13" onChange={jest.fn()} />);
    expect(screen.getByText('Mar 13, 2026')).toBeTruthy();
  });

  it('shows placeholder when no value', () => {
    render(<DatePickerField value="" onChange={jest.fn()} />);
    expect(screen.getByText('Select a date')).toBeTruthy();
  });

  it('shows error message', () => {
    render(<DatePickerField value="2026-03-13" onChange={jest.fn()} error="Date required" />);
    expect(screen.getByText('Date required')).toBeTruthy();
  });

  it('opens picker on press', () => {
    render(<DatePickerField value="2026-03-13" onChange={jest.fn()} />);
    fireEvent.press(screen.getByText('Mar 13, 2026'));
    // The picker should be shown (test that press doesn't throw)
  });
});
