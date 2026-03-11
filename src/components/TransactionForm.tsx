import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { DatePickerField } from './ui/DatePickerField';
import { CategoryPicker } from './CategoryPicker';
import { Category, CreateTransactionInput } from '../db/types';
import { getTodayISO } from '../utils/dates';

interface TransactionFormProps {
  initialValues?: {
    amount: string;
    type: 'expense' | 'income';
    category_id: number | null;
    description: string;
    date: string;
  };
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export function TransactionForm({ initialValues, onSubmit, onDelete, submitLabel }: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>(initialValues?.type ?? 'expense');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.date ?? getTodayISO());
  const [categoryId, setCategoryId] = useState<number | null>(initialValues?.category_id ?? null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!categoryId) {
      newErrors.category = 'Select a category';
    }
    if (!date) {
      newErrors.date = 'Enter a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSubmit({
      amount: Number(amount),
      type,
      category_id: categoryId!,
      description: description || undefined,
      date,
    });
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-down-outline"
            size={16}
            color={type === 'expense' ? colors.danger : colors.textMuted}
          />
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextExpense]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up-outline"
            size={16}
            color={type === 'income' ? colors.success : colors.textMuted}
          />
          <Text style={[styles.typeText, type === 'income' && styles.typeTextIncome]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Amount (EUR)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What was this for?"
      />

      <DatePickerField
        label="Date"
        value={date}
        onChange={setDate}
        error={errors.date}
      />

      <CategoryPicker
        type={type}
        selectedId={categoryId}
        onSelect={(cat: Category) => setCategoryId(cat.id)}
      />
      {errors.category && <Text style={styles.categoryError}>{errors.category}</Text>}

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        size="lg"
      />

      {onDelete && (
        <Button
          title="Delete Transaction"
          onPress={onDelete}
          variant="danger"
          style={styles.deleteButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  typeTextExpense: {
    color: colors.danger,
  },
  typeTextIncome: {
    color: colors.success,
  },
  categoryError: {
    fontSize: 12,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
});
