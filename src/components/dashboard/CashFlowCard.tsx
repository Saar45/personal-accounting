import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { Card } from '../ui/Card';
import { useCurrency } from '../../hooks/useCurrency';
import { useMonthlyTotals } from '../../hooks/useTransactions';
import { getCurrentMonthYear, getMonthName } from '../../utils/dates';

export function CashFlowCard() {
  const { formatAmount } = useCurrency();
  const { income, expenses, loading } = useMonthlyTotals();
  const { month } = getCurrentMonthYear();
  const net = income - expenses;
  const maxValue = Math.max(income, expenses, 1);

  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="trending-up-outline" size={16} color={colors.primaryLight} />
        <Text style={styles.title}>Cash Flow</Text>
        <Text style={styles.period}>{getMonthName(month)}</Text>
      </View>

      <View style={styles.barRow}>
        <Text style={styles.barLabel}>Income</Text>
        <View style={styles.barTrack}>
          <View
            style={[styles.bar, styles.barIncome, { width: `${(income / maxValue) * 100}%` }]}
          />
        </View>
        <Text style={[styles.barValue, { color: colors.success }]}>
          {loading ? '---' : formatAmount(income)}
        </Text>
      </View>

      <View style={styles.barRow}>
        <Text style={styles.barLabel}>Expenses</Text>
        <View style={styles.barTrack}>
          <View
            style={[styles.bar, styles.barExpense, { width: `${(expenses / maxValue) * 100}%` }]}
          />
        </View>
        <Text style={[styles.barValue, { color: colors.danger }]}>
          {loading ? '---' : formatAmount(expenses)}
        </Text>
      </View>

      <View style={styles.netRow}>
        <Text style={styles.netLabel}>Net</Text>
        <Text style={[styles.netValue, { color: net >= 0 ? colors.success : colors.danger }]}>
          {loading ? '---' : `${net >= 0 ? '+' : ''}${formatAmount(net)}`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  period: {
    fontSize: 13,
    color: colors.textMuted,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  barLabel: {
    width: 65,
    fontSize: 13,
    color: colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  barIncome: {
    backgroundColor: colors.success,
  },
  barExpense: {
    backgroundColor: colors.danger,
  },
  barValue: {
    width: 90,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  netValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
