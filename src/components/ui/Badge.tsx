import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface BadgeProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ icon, color, size = 'md' }: BadgeProps) {
  const dimensions = size === 'sm' ? 28 : size === 'md' ? 36 : 44;
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  return (
    <View style={[
      styles.badge,
      {
        width: dimensions,
        height: dimensions,
        borderRadius: dimensions / 2,
        backgroundColor: color + '20',
      },
    ]}>
      <Ionicons name={icon as any} size={iconSize} color={color} />
    </View>
  );
}

interface StatusBadgeProps {
  label: string;
  variant: 'success' | 'danger' | 'warning' | 'neutral';
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const badgeColors = {
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    neutral: colors.textMuted,
  };

  const color = badgeColors[variant];

  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
