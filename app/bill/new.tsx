import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/theme';
import { BillForm } from '../../src/components/BillForm';
import { createBill } from '../../src/db/bills';
import { useDatabase } from '../../src/hooks/useDatabase';
import { CreateBillInput } from '../../src/db/types';

export default function NewBillScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (input: CreateBillInput) => {
    await createBill(input);
    triggerRefresh();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BillForm onSubmit={handleSubmit} submitLabel="Add Bill" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
