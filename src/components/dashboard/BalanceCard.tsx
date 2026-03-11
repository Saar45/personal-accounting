import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { formatEUR } from '../../utils/currency';
import { useTotalBalance, useMonthlyTotals } from '../../hooks/useTransactions';

export function BalanceCard() {
  const { balance, loading: balanceLoading } = useTotalBalance();
  const { income, expenses, loading: monthlyLoading } = useMonthlyTotals();

  return (
    <LinearGradient
      colors={['#6C5CE7', '#3D2E8C', '#1A1A23']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>
        {balanceLoading ? '---' : formatEUR(balance)}
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons name="arrow-up" size={12} color={colors.success} />
          </View>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {monthlyLoading ? '---' : formatEUR(income)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons name="arrow-down" size={12} color={colors.danger} />
          </View>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {monthlyLoading ? '---' : formatEUR(expenses)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.md,
  },
});
