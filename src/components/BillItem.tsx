import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { BillWithCategory } from '../db/types';
import { useCurrency } from '../hooks/useCurrency';
import { getRelativeDueDate, getDueDateColor } from '../utils/dates';
import { Badge, StatusBadge } from './ui/Badge';

interface BillItemProps {
  bill: BillWithCategory;
  onPress: () => void;
  onMarkPaid?: () => void;
}

export function BillItem({ bill, onPress, onMarkPaid }: BillItemProps) {
  const { formatAmount } = useCurrency();
  const dueDateText = getRelativeDueDate(bill.next_due_date);
  const dueDateColor = getDueDateColor(bill.next_due_date);

  return (
    <TouchableOpacity
      style={[styles.container, !bill.is_active && styles.inactive]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Badge icon={bill.category_icon} color={bill.category_color} />
      <View style={styles.details}>
        <Text style={[styles.name, !bill.is_active && styles.nameInactive]} numberOfLines={1}>
          {bill.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.frequency}>{bill.frequency}</Text>
          {bill.is_active ? (
            <Text style={[styles.dueDate, { color: dueDateColor }]}>{dueDateText}</Text>
          ) : (
            <StatusBadge label="Paused" variant="neutral" />
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatAmount(bill.amount)}</Text>
        {onMarkPaid && bill.is_active ? (
          <TouchableOpacity style={styles.markPaidButton} onPress={onMarkPaid} activeOpacity={0.7}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.markPaidText}>Paid</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  inactive: {
    opacity: 0.5,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  nameInactive: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  frequency: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  markPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.success + '15',
  },
  markPaidText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
});
