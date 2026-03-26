import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('renders with default variant', () => {
    const { root } = render(
      <Card>
        <Text>Default</Text>
      </Card>
    );
    expect(root).toBeTruthy();
  });

  it('renders with elevated variant', () => {
    const { root } = render(
      <Card variant="elevated">
        <Text>Elevated</Text>
      </Card>
    );
    expect(root).toBeTruthy();
    expect(screen.getByText('Elevated')).toBeTruthy();
  });
});
