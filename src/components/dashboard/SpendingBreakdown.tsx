import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCurrency } from '../../hooks/useCurrency';
import { useSpendingByCategory } from '../../hooks/useTransactions';

export function SpendingBreakdown() {
  const { formatAmount } = useCurrency();
  const { spending, loading } = useSpendingByCategory();

  if (spending.length === 0 && !loading) {
    return null;
  }

  const maxSpending = spending.length > 0 ? spending[0].total : 1;

  return (
    <Card>
      <View style={styles.header}>
        <Ionicons name="pricetag-outline" size={16} color={colors.primaryLight} />
        <Text style={styles.title}>Spending Breakdown</Text>
      </View>

      {spending.length === 0 ? (
        <Text style={styles.empty}>No expenses this month</Text>
      ) : (
        spending.map((item, index) => (
          <View key={item.category_id}>
            {index > 0 && <View style={styles.spacer} />}
            <View style={styles.row}>
              <Badge icon={item.category_icon} color={item.category_color} size="sm" />
              <Text style={styles.categoryName}>{item.category_name}</Text>
              <Text style={styles.amount}>{formatAmount(item.total)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.total / maxSpending) * 100}%`,
                    backgroundColor: item.category_color,
                  },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 36,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  spacer: {
    height: spacing.sm,
  },
});
