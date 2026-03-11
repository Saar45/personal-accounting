import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { TransferForm } from '../../src/components/TransferForm';
import { getDatabase } from '../../src/db/database';
import { useDatabase } from '../../src/hooks/useDatabase';

export default function NewTransferScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (
    amount: number,
    fromAccountId: number,
    toAccountId: number,
    date: string,
    description?: string
  ) => {
    const db = await getDatabase();

    // Find or use a "Transfer" or "Other" category
    const transferCategory = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM categories WHERE name = 'Transfer' LIMIT 1"
    );
    const categoryId = transferCategory
      ? transferCategory.id
      : (await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM categories WHERE name = 'Other' LIMIT 1"
        ))?.id ?? 1;

    const transferDesc = description || 'Transfer';

    // Create expense transaction (from account)
    const expenseResult = await db.runAsync(
      'INSERT INTO transactions (amount, type, category_id, description, date, account_id, is_transfer, linked_transaction_id) VALUES (?, ?, ?, ?, ?, ?, 1, NULL)',
      amount,
      'expense',
      categoryId,
      transferDesc,
      date,
      fromAccountId
    );
    const expenseId = expenseResult.lastInsertRowId;

    // Create income transaction (to account)
    const incomeResult = await db.runAsync(
      'INSERT INTO transactions (amount, type, category_id, description, date, account_id, is_transfer, linked_transaction_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
      amount,
      'income',
      categoryId,
      transferDesc,
      date,
      toAccountId,
      expenseId
    );
    const incomeId = incomeResult.lastInsertRowId;

    // Update expense to point to income
    await db.runAsync(
      'UPDATE transactions SET linked_transaction_id = ? WHERE id = ?',
      incomeId,
      expenseId
    );

    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TransferForm onSubmit={handleSubmit} submitLabel="Transfer" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
