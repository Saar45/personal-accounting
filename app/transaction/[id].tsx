import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { TransactionForm } from '../../src/components/TransactionForm';
import { getTransactionById, updateTransaction, deleteTransaction } from '../../src/db/transactions';
import { useDatabase } from '../../src/hooks/useDatabase';
import { TransactionWithCategory, CreateTransactionInput } from '../../src/db/types';

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerRefresh } = useDatabase();
  const [transaction, setTransaction] = useState<TransactionWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getTransactionById(Number(id)).then((t) => {
        setTransaction(t);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !transaction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: CreateTransactionInput) => {
    await updateTransaction(Number(id), input);
    triggerRefresh();
    router.back();
  };

  const handleDelete = async () => {
    await deleteTransaction(Number(id));
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TransactionForm
        initialValues={{
          amount: transaction.amount.toString(),
          type: transaction.type,
          category_id: transaction.category_id,
          description: transaction.description ?? '',
          date: transaction.date,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Update Transaction"
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
