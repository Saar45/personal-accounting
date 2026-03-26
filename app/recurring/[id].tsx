import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { RecurringForm } from '../../src/components/RecurringForm';
import { getRecurringById, updateRecurring, deleteRecurring } from '../../src/db/recurring';
import { useDatabase } from '../../src/hooks/useDatabase';
import { RecurringTransactionWithCategory, CreateRecurringTransactionInput } from '../../src/db/types';

export default function EditRecurringScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerRefresh } = useDatabase();
  const [recurring, setRecurring] = useState<RecurringTransactionWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getRecurringById(Number(id)).then((r) => {
        setRecurring(r);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !recurring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: CreateRecurringTransactionInput) => {
    await updateRecurring(Number(id), input);
    triggerRefresh();
    router.back();
  };

  const handleDelete = async () => {
    await deleteRecurring(Number(id));
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <RecurringForm
        initialValues={{
          amount: recurring.amount.toString(),
          type: recurring.type,
          category_id: recurring.category_id,
          description: recurring.description ?? '',
          frequency: recurring.frequency,
          next_occurrence: recurring.next_occurrence,
          currency: recurring.currency,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Update Recurring Transaction"
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
