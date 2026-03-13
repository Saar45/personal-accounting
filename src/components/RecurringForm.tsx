import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { CategoryPicker } from './CategoryPicker';
import { DatePickerField } from './ui/DatePickerField';
import { CurrencyPickerField } from './ui/CurrencyPickerField';
import { Category, CreateRecurringTransactionInput } from '../db/types';
import { getTodayISO } from '../utils/dates';
import { useCurrency } from '../hooks/useCurrency';

const FREQUENCIES = [
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' },
  { key: 'yearly' as const, label: 'Yearly' },
];

interface RecurringFormProps {
  initialValues?: {
    amount: string;
    type: 'expense' | 'income';
    category_id: number | null;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    next_occurrence: string;
    currency?: string;
  };
  onSubmit: (input: CreateRecurringTransactionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export function RecurringForm({ initialValues, onSubmit, onDelete, submitLabel }: RecurringFormProps) {
  const { currency } = useCurrency();
  const [type, setType] = useState<'expense' | 'income'>(initialValues?.type ?? 'expense');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    initialValues?.frequency ?? 'monthly'
  );
  const [nextOccurrence, setNextOccurrence] = useState(initialValues?.next_occurrence ?? getTodayISO());
  const [categoryId, setCategoryId] = useState<number | null>(initialValues?.category_id ?? null);
  const [recCurrency, setRecCurrency] = useState(initialValues?.currency ?? currency);
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
    if (!nextOccurrence) {
      newErrors.nextOccurrence = 'Select the next occurrence date';
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
      frequency,
      next_occurrence: nextOccurrence,
      currency: recCurrency,
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
        label={`Amount (${recCurrency})`}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
      />

      <CurrencyPickerField
        label="Currency"
        value={recCurrency}
        onChange={setRecCurrency}
      />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What is this recurring transaction for?"
      />

      <Text style={styles.sectionLabel}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.frequencyChip, frequency === f.key && styles.frequencyChipActive]}
            onPress={() => setFrequency(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.frequencyText, frequency === f.key && styles.frequencyTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DatePickerField
        label="Next Occurrence"
        value={nextOccurrence}
        onChange={setNextOccurrence}
        error={errors.nextOccurrence}
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
          title="Delete Recurring Transaction"
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  frequencyChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  frequencyChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  frequencyTextActive: {
    color: colors.primary,
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
