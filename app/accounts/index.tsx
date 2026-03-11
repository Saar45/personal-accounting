import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows } from '../../src/constants/theme';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/EmptyState';
import { formatEUR } from '../../src/utils/currency';
import { useAccounts } from '../../src/hooks/useAccounts';
import { getAccountBalance } from '../../src/db/accounts';
import { useDatabase } from '../../src/hooks/useDatabase';
import { Account } from '../../src/db/types';

function AccountRow({ account }: { account: Account }) {
  const router = useRouter();
  const { isReady, refreshKey } = useDatabase();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!isReady) return;
    getAccountBalance(account.id).then(setBalance);
  }, [isReady, refreshKey, account.id]);

  return (
    <TouchableOpacity
      style={styles.accountRow}
      onPress={() => router.push(`/accounts/${account.id}`)}
      activeOpacity={0.7}
    >
      <Badge icon={account.icon} color={account.color} size="lg" />
      <View style={styles.accountDetails}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountType}>{account.type}</Text>
      </View>
      <Text style={styles.accountBalance}>
        {balance !== null ? formatEUR(balance) : '...'}
      </Text>
    </TouchableOpacity>
  );
}

export default function AccountsScreen() {
  const { accounts, loading } = useAccounts();
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
      {accounts.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No Accounts"
          message="Add your first account to track balances across different wallets and banks."
          actionLabel="Add Account"
          onAction={() => router.push('/accounts/new')}
        />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <AccountRow account={item} />}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/accounts/new')}
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
  accountRow: {
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
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountType: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
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
