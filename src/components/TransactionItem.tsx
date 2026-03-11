import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { TransactionWithCategory } from '../db/types';
import { formatEUR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { Badge } from './ui/Badge';

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onPress: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <Badge icon={transaction.category_icon} color={transaction.category_color} />
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || transaction.category_name}
        </Text>
        <Text style={styles.meta}>
          {transaction.category_name} · {formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.amountIncome : styles.amountExpense]}>
        {isIncome ? '+' : '-'}{formatEUR(transaction.amount)}
      </Text>
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
  details: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountIncome: {
    color: colors.success,
  },
  amountExpense: {
    color: colors.danger,
  },
});
