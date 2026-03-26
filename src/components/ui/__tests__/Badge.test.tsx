import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge, StatusBadge } from '../Badge';

describe('Badge', () => {
  it('renders with icon name', () => {
    render(<Badge icon="restaurant-outline" color="#FF6B6B" />);
    // Ionicons is mocked to render the name as text
    expect(screen.getByText('restaurant-outline')).toBeTruthy();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <Badge icon="star-outline" color="#6C5CE7" size={size} />
      );
      expect(screen.getByText('star-outline')).toBeTruthy();
      unmount();
    }
  });
});

describe('StatusBadge', () => {
  it('renders label text', () => {
    render(<StatusBadge label="Active" variant="success" />);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('renders all variants', () => {
    const variants = ['success', 'danger', 'warning', 'neutral'] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <StatusBadge label={variant} variant={variant} />
      );
      expect(screen.getByText(variant)).toBeTruthy();
      unmount();
    }
  });
});
