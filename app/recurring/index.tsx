import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { useRecurringTransactions } from '../../src/hooks/useRecurring';
import { RecurringTransactionWithCategory } from '../../src/db/types';
import { Badge, StatusBadge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/EmptyState';
import { formatEUR } from '../../src/utils/currency';
import { formatDate } from '../../src/utils/dates';

function FrequencyTag({ frequency }: { frequency: string }) {
  return (
    <View style={styles.frequencyTag}>
      <Text style={styles.frequencyTagText}>{frequency}</Text>
    </View>
  );
}

function RecurringItem({
  item,
  onPress,
}: {
  item: RecurringTransactionWithCategory;
  onPress: () => void;
}) {
  const isExpense = item.type === 'expense';

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress} activeOpacity={0.7}>
      <Badge icon={item.category_icon} color={item.category_color} />
      <View style={styles.itemContent}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemDescription} numberOfLines={1}>
            {item.description || item.category_name}
          </Text>
          <Text style={[styles.itemAmount, { color: isExpense ? colors.danger : colors.success }]}>
            {isExpense ? '-' : '+'}{formatEUR(item.amount)}
          </Text>
        </View>
        <View style={styles.itemBottomRow}>
          <FrequencyTag frequency={item.frequency} />
          <Text style={styles.itemNextDate}>
            Next: {formatDate(item.next_occurrence)}
          </Text>
          {!item.is_active && (
            <StatusBadge label="Paused" variant="neutral" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RecurringListScreen() {
  const router = useRouter();
  const { recurring, loading } = useRecurringTransactions();

  return (
    <View style={styles.container}>
      <FlatList
        data={recurring}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecurringItem
            item={item}
            onPress={() => router.push(`/recurring/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="repeat-outline"
              title="No Recurring Transactions"
              message="Set up recurring transactions to automatically track regular income and expenses."
              actionLabel="Add Recurring"
              onAction={() => router.push('/recurring/new')}
            />
          ) : null
        }
        contentContainerStyle={recurring.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/recurring/new')}
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
  listContent: {
    padding: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  frequencyTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '20',
  },
  frequencyTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  itemNextDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
