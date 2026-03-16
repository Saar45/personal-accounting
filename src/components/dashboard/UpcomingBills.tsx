import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCurrency } from '../../hooks/useCurrency';
import { getRelativeDueDate, getDueDateColor } from '../../utils/dates';
import { useUpcomingBills } from '../../hooks/useBills';

export function UpcomingBills() {
  const { formatAmount } = useCurrency();
  const { bills, loading } = useUpcomingBills(3);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={16} color={colors.primaryLight} />
        <Text style={styles.title}>Upcoming Bills</Text>
      </View>
      {bills.length === 0 ? (
        <Text style={styles.empty}>No upcoming bills</Text>
      ) : (
        bills.map((bill, index) => {
          const dueDateColor = getDueDateColor(bill.next_due_date);
          return (
            <View key={bill.id}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.billRow}>
                <Badge icon={bill.category_icon} color={bill.category_color} size="sm" />
                <View style={styles.billDetails}>
                  <Text style={styles.billName} numberOfLines={1}>{bill.name}</Text>
                  <Text style={[styles.dueDate, { color: dueDateColor }]}>
                    {getRelativeDueDate(bill.next_due_date)}
                  </Text>
                </View>
                <Text style={styles.billAmount}>{formatAmount(bill.amount)}</Text>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
  },
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
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
