import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { CategoryPicker } from './CategoryPicker';
import { Category, CreateBillInput } from '../db/types';
import { computeNextDueDate } from '../utils/dates';

interface BillFormProps {
  initialValues?: {
    name: string;
    amount: string;
    category_id: number | null;
    frequency: 'weekly' | 'monthly' | 'yearly';
    due_day: string;
  };
  onSubmit: (input: CreateBillInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export function BillForm({ initialValues, onSubmit, onDelete, submitLabel }: BillFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>(
    initialValues?.frequency ?? 'monthly'
  );
  const [dueDay, setDueDay] = useState(initialValues?.due_day ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(initialValues?.category_id ?? null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const frequencies: Array<{ value: 'weekly' | 'monthly' | 'yearly'; label: string }> = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Enter a name';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (!dueDay || isNaN(Number(dueDay)) || Number(dueDay) < 1) {
      newErrors.dueDay = 'Enter a valid day';
    }
    if (frequency === 'monthly' && (Number(dueDay) > 31)) {
      newErrors.dueDay = 'Day must be 1-31';
    }
    if (frequency === 'weekly' && (Number(dueDay) > 7)) {
      newErrors.dueDay = 'Day must be 1-7 (Mon-Sun)';
    }
    if (!categoryId) newErrors.category = 'Select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const dueDayNum = Number(dueDay);
    await onSubmit({
      name: name.trim(),
      amount: Number(amount),
      category_id: categoryId!,
      frequency,
      due_day: dueDayNum,
      next_due_date: computeNextDueDate(frequency, dueDayNum),
    });
    setLoading(false);
  };

  const dueDayLabel = frequency === 'weekly'
    ? 'Day of week (1=Mon, 7=Sun)'
    : frequency === 'monthly'
    ? 'Day of month (1-31)'
    : 'Day of year (1-365)';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Input
        label="Bill Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., Rent, Netflix, Electric"
        error={errors.name}
      />

      <Input
        label="Amount (EUR)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
      />

      <Text style={styles.label}>FREQUENCY</Text>
      <View style={styles.frequencyRow}>
        {frequencies.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.freqButton, frequency === f.value && styles.freqButtonActive]}
            onPress={() => setFrequency(f.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.freqText, frequency === f.value && styles.freqTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label={dueDayLabel}
        value={dueDay}
        onChangeText={setDueDay}
        keyboardType="number-pad"
        placeholder="1"
        error={errors.dueDay}
      />

      <CategoryPicker
        type="expense"
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
          title="Delete Bill"
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
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  freqButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  freqButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  freqText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  freqTextActive: {
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
