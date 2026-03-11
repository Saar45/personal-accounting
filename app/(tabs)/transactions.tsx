import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../src/constants/theme';
import { useTransactions } from '../../src/hooks/useTransactions';
import { TransactionItem } from '../../src/components/TransactionItem';
import { EmptyState } from '../../src/components/EmptyState';

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, loading } = useTransactions();

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/transaction/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="swap-vertical-outline"
              title="No transactions yet"
              message="Start tracking your income and expenses by adding your first transaction."
              actionLabel="Add Transaction"
              onAction={() => router.push('/transaction/new')}
            />
          ) : null
        }
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/transaction/new')}
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
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 62,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
