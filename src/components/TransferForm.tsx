import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { DatePickerField } from './ui/DatePickerField';
import { Account } from '../db/types';
import { getDatabase } from '../db/database';
import { getTodayISO } from '../utils/dates';

interface TransferFormProps {
  onSubmit: (
    amount: number,
    fromAccountId: number,
    toAccountId: number,
    date: string,
    description?: string
  ) => Promise<void>;
  submitLabel: string;
}

export function TransferForm({ onSubmit, submitLabel }: TransferFormProps) {
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountId, setToAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(getTodayISO());
  const [description, setDescription] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadAccounts() {
      const db = await getDatabase();
      const data = await db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY name ASC');
      setAccounts(data);
      setAccountsLoading(false);
    }
    loadAccounts();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!fromAccountId) {
      newErrors.fromAccount = 'Select a source account';
    }
    if (!toAccountId) {
      newErrors.toAccount = 'Select a destination account';
    }
    if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
      newErrors.toAccount = 'Accounts must be different';
    }
    if (!date) {
      newErrors.date = 'Select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSubmit(
      Number(amount),
      fromAccountId!,
      toAccountId!,
      date,
      description || undefined
    );
    setLoading(false);
  };

  if (accountsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Input
        label="Amount (EUR)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
      />

      <Text style={styles.sectionLabel}>From Account</Text>
      <View style={styles.accountGrid}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={`from-${account.id}`}
            style={[
              styles.accountChip,
              fromAccountId === account.id && styles.accountChipActive,
            ]}
            onPress={() => setFromAccountId(account.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={account.icon as any}
              size={18}
              color={fromAccountId === account.id ? account.color : colors.textMuted}
            />
            <Text
              style={[
                styles.accountChipText,
                fromAccountId === account.id && styles.accountChipTextActive,
              ]}
              numberOfLines={1}
            >
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.fromAccount && <Text style={styles.error}>{errors.fromAccount}</Text>}

      <View style={styles.swapContainer}>
        <View style={styles.swapLine} />
        <View style={styles.swapIcon}>
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
        </View>
        <View style={styles.swapLine} />
      </View>

      <Text style={styles.sectionLabel}>To Account</Text>
      <View style={styles.accountGrid}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={`to-${account.id}`}
            style={[
              styles.accountChip,
              toAccountId === account.id && styles.accountChipActive,
            ]}
            onPress={() => setToAccountId(account.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={account.icon as any}
              size={18}
              color={toAccountId === account.id ? account.color : colors.textMuted}
            />
            <Text
              style={[
                styles.accountChipText,
                toAccountId === account.id && styles.accountChipTextActive,
              ]}
              numberOfLines={1}
            >
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.toAccount && <Text style={styles.error}>{errors.toAccount}</Text>}

      <DatePickerField
        label="Date"
        value={date}
        onChange={setDate}
        error={errors.date}
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Transfer note (optional)"
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        size="lg"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  accountChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  accountChipTextActive: {
    color: colors.textPrimary,
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  swapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
