import { StyleSheet } from 'react-native';

export const colors = {
  background: '#0F0F13',
  surface: '#1A1A23',
  surfaceLight: '#252530',

  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  success: '#00B894',
  danger: '#FF6B6B',
  warning: '#FDCB6E',

  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E9A',
  textMuted: '#5C5C6E',

  border: '#2A2A35',
  borderLight: '#353542',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  amountSmall: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export const shadows = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  elevated: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
});
