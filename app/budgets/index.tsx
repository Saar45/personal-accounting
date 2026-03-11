import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../src/constants/theme';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/EmptyState';
import { formatEUR } from '../../src/utils/currency';
import { useBudgetProgress } from '../../src/hooks/useBudgets';
import { BudgetWithProgress } from '../../src/db/types';

function getProgressColor(ratio: number): string {
  if (ratio > 1) return colors.danger;
  if (ratio >= 0.8) return colors.warning;
  return colors.success;
}

function BudgetRow({ budget }: { budget: BudgetWithProgress }) {
  const ratio = budget.amount > 0 ? budget.spent / budget.amount : 0;
  const progressWidth = Math.min(ratio, 1) * 100;
  const progressColor = getProgressColor(ratio);
  const overBudget = ratio > 1;

  return (
    <View style={styles.budgetRow}>
      <Badge icon={budget.category_icon} color={budget.category_color} />
      <View style={styles.budgetDetails}>
        <View style={styles.budgetTextRow}>
          <Text style={styles.budgetName} numberOfLines={1}>{budget.category_name}</Text>
          <Text style={styles.periodBadge}>{budget.period}</Text>
        </View>
        <View style={styles.amountsRow}>
          <Text style={[styles.spentText, overBudget && { color: colors.danger }]}>
            {formatEUR(budget.spent)}
          </Text>
          <Text style={styles.ofText}> of </Text>
          <Text style={styles.budgetAmountText}>{formatEUR(budget.amount)}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressWidth}%`, backgroundColor: progressColor }]} />
        </View>
      </View>
    </View>
  );
}

export default function BudgetsScreen() {
  const { budgets, loading } = useBudgetProgress();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {budgets.length === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          title="No Budgets"
          message="Set budgets for your expense categories to track your spending."
          actionLabel="Add Budget"
          onAction={() => router.push('/budgets/new')}
        />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <BudgetRow budget={item} />}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/budgets/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  periodBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  ofText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  budgetAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  separator: {
    height: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
});
