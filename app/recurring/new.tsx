import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { RecurringForm } from '../../src/components/RecurringForm';
import { createRecurring } from '../../src/db/recurring';
import { useDatabase } from '../../src/hooks/useDatabase';
import { CreateRecurringTransactionInput } from '../../src/db/types';

export default function NewRecurringScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (input: CreateRecurringTransactionInput) => {
    await createRecurring(input);
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <RecurringForm onSubmit={handleSubmit} submitLabel="Add Recurring Transaction" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
