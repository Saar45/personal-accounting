import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../src/constants/theme';
import { useBills } from '../../src/hooks/useBills';
import { BillItem } from '../../src/components/BillItem';
import { EmptyState } from '../../src/components/EmptyState';

export default function BillsScreen() {
  const router = useRouter();
  const { bills, loading } = useBills();

  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BillItem
            bill={item}
            onPress={() => router.push(`/bill/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="calendar-outline"
              title="No bills yet"
              message="Keep track of your recurring bills like rent, subscriptions, and utilities."
              actionLabel="Add Bill"
              onAction={() => router.push('/bill/new')}
            />
          ) : null
        }
        contentContainerStyle={bills.length === 0 ? styles.emptyList : styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/bill/new')}
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
