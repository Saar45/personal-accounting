import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { AccountForm } from '../../src/components/AccountForm';
import { getAccountById, updateAccount, deleteAccount } from '../../src/db/accounts';
import { useDatabase } from '../../src/hooks/useDatabase';
import { Account, CreateAccountInput } from '../../src/db/types';

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerRefresh } = useDatabase();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getAccountById(Number(id)).then((a) => {
        setAccount(a);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !account) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: CreateAccountInput) => {
    await updateAccount(Number(id), input);
    triggerRefresh();
    router.back();
  };

  const handleDelete = async () => {
    await deleteAccount(Number(id));
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AccountForm
        initialValues={{
          name: account.name,
          type: account.type,
          icon: account.icon,
          color: account.color,
          initial_balance: account.initial_balance.toString(),
        }}
        onSubmit={handleSubmit}
        onDelete={account.is_default ? undefined : handleDelete}
        submitLabel="Update Account"
      />
    </SafeAreaView>
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
});
