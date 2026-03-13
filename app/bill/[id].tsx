import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { BillForm } from '../../src/components/BillForm';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { getBillById, updateBill, deleteBill } from '../../src/db/bills';
import { createBillPayment, getPaymentsForBill, deleteBillPayment } from '../../src/db/bill-payments';
import { useDatabase } from '../../src/hooks/useDatabase';
import { BillWithCategory, BillPayment, CreateBillInput } from '../../src/db/types';
import { useCurrency } from '../../src/hooks/useCurrency';
import { useExchangeRates } from '../../src/hooks/useExchangeRates';
import { formatDate, getTodayISO } from '../../src/utils/dates';

export default function EditBillScreen() {
  const { formatAmount } = useCurrency();
  const { convertAmount } = useExchangeRates();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { triggerRefresh, refreshKey } = useDatabase();
  const [bill, setBill] = useState<BillWithCategory | null>(null);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        getBillById(Number(id)),
        getPaymentsForBill(Number(id)),
      ]).then(([b, p]) => {
        setBill(b);
        setPayments(p);
        setLoading(false);
      });
    }
  }, [id, refreshKey]);

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

  const handleMarkPaid = async () => {
    await createBillPayment({ bill_id: Number(id), amount: bill.amount, paid_date: getTodayISO(), currency: bill.currency });
    triggerRefresh();
  };

  const handleDeletePayment = (paymentId: number) => {
    Alert.alert('Delete Payment', 'Remove this payment record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteBillPayment(paymentId);
          triggerRefresh();
        },
      },
    ]);
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
          currency: bill.currency,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Update Bill"
      />

      {payments.length > 0 && (
        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <Card>
            {payments.map((payment, index) => (
              <View key={payment.id}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.paymentRow}>
                  <View>
                    <Text style={styles.paymentDate}>{formatDate(payment.paid_date)}</Text>
                  </View>
                  <Text style={styles.paymentAmount}>{formatAmount(convertAmount(payment.amount, payment.currency))}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={styles.markPaidSection}>
        <Button title="Mark as Paid Today" onPress={handleMarkPaid} variant="secondary" />
      </View>
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
  paymentsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  paymentDate: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  markPaidSection: {
    padding: spacing.md,
  },
});
