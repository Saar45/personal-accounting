import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { TransactionForm } from '../../src/components/TransactionForm';
import { createTransaction } from '../../src/db/transactions';
import { useDatabase } from '../../src/hooks/useDatabase';
import { CreateTransactionInput } from '../../src/db/types';

export default function NewTransactionScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (input: CreateTransactionInput) => {
    await createTransaction(input);
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TransactionForm onSubmit={handleSubmit} submitLabel="Add Transaction" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
