import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCurrency } from '../../hooks/useCurrency';
import { useBudgetProgress } from '../../hooks/useBudgets';

function getProgressColor(ratio: number): string {
  if (ratio > 1) return colors.danger;
  if (ratio >= 0.8) return colors.warning;
  return colors.success;
}

export function BudgetOverview() {
  const { formatAmount } = useCurrency();
  const { budgets, loading } = useBudgetProgress();
  const router = useRouter();
  const topBudgets = budgets.slice(0, 3);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="pie-chart-outline" size={16} color={colors.primaryLight} />
        <Text style={styles.title}>Budget Overview</Text>
      </View>
      {topBudgets.length === 0 ? (
        <Text style={styles.empty}>No budgets set</Text>
      ) : (
        topBudgets.map((budget, index) => {
          const ratio = budget.amount > 0 ? budget.spent / budget.amount : 0;
          const progressWidth = Math.min(ratio, 1) * 100;
          const progressColor = getProgressColor(ratio);
          return (
            <View key={budget.id}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.budgetRow}>
                <Badge icon={budget.category_icon} color={budget.category_color} size="sm" />
                <View style={styles.budgetDetails}>
                  <View style={styles.budgetTextRow}>
                    <Text style={styles.budgetName} numberOfLines={1}>{budget.category_name}</Text>
                    <Text style={styles.budgetAmounts}>
                      {formatAmount(budget.spent)} / {formatAmount(budget.amount)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressWidth}%`, backgroundColor: progressColor }]} />
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}
      {budgets.length > 0 && (
        <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/budgets')} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  budgetAmounts: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
