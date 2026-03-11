import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { BillForm } from '../../src/components/BillForm';
import { getBillById, updateBill, deleteBill } from '../../src/db/bills';
import { useDatabase } from '../../src/hooks/useDatabase';
import { BillWithCategory, CreateBillInput } from '../../src/db/types';

export default function EditBillScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerRefresh } = useDatabase();
  const [bill, setBill] = useState<BillWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getBillById(Number(id)).then((b) => {
        setBill(b);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading || !bill) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: CreateBillInput) => {
    await updateBill(Number(id), input);
    triggerRefresh();
    router.back();
  };

  const handleDelete = async () => {
    await deleteBill(Number(id));
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BillForm
        initialValues={{
          name: bill.name,
          amount: bill.amount.toString(),
          category_id: bill.category_id,
          frequency: bill.frequency,
          due_day: bill.due_day.toString(),
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Update Bill"
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
