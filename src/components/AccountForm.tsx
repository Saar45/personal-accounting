import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import ColorPicker from './ColorPicker';
import { CreateAccountInput } from '../db/types';

const ACCOUNT_TYPES: Array<{ value: CreateAccountInput['type']; label: string; icon: string }> = [
  { value: 'checking', label: 'Checking', icon: 'card-outline' },
  { value: 'savings', label: 'Savings', icon: 'wallet-outline' },
  { value: 'cash', label: 'Cash', icon: 'cash-outline' },
  { value: 'credit', label: 'Credit', icon: 'card-outline' },
  { value: 'investment', label: 'Investment', icon: 'trending-up-outline' },
];

const ACCOUNT_ICONS = [
  'wallet-outline', 'card-outline', 'cash-outline', 'trending-up-outline',
  'business-outline', 'home-outline', 'diamond-outline', 'shield-outline',
];

interface AccountFormProps {
  initialValues?: {
    name: string;
    type: CreateAccountInput['type'];
    icon: string;
    color: string;
    initial_balance: string;
  };
  onSubmit: (input: CreateAccountInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export function AccountForm({ initialValues, onSubmit, onDelete, submitLabel }: AccountFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [type, setType] = useState<CreateAccountInput['type']>(initialValues?.type ?? 'checking');
  const [icon, setIcon] = useState(initialValues?.icon ?? 'wallet-outline');
  const [color, setColor] = useState(initialValues?.color ?? '#6C5CE7');
  const [initialBalance, setInitialBalance] = useState(initialValues?.initial_balance ?? '0');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    const balanceNum = parseFloat(initialBalance);
    if (isNaN(balanceNum)) newErrors.balance = 'Invalid amount';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        icon,
        color,
        initial_balance: parseFloat(initialBalance) || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('Delete Account', 'Are you sure you want to delete this account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Account Name"
        value={name}
        onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
        placeholder="e.g. Main Checking"
        error={errors.name}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {ACCOUNT_TYPES.map((t) => {
            const isSelected = t.value === type;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setType(t.value)}
                activeOpacity={0.7}
              >
                <Ionicons name={t.icon as any} size={16} color={isSelected ? colors.primary : colors.textSecondary} />
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ACCOUNT_ICONS.map((ic) => {
            const isSelected = ic === icon;
            return (
              <TouchableOpacity
                key={ic}
                style={[styles.iconItem, isSelected && styles.iconItemSelected]}
                onPress={() => setIcon(ic)}
                activeOpacity={0.7}
              >
                <Ionicons name={ic as any} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ColorPicker selectedColor={color} onSelect={setColor} />
      </View>

      <Input
        label="Initial Balance"
        value={initialBalance}
        onChangeText={(v) => { setInitialBalance(v); setErrors((e) => ({ ...e, balance: undefined })); }}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.balance}
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        size="lg"
      />

      {onDelete && (
        <Button
          title="Delete Account"
          onPress={handleDelete}
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
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconItem: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  deleteButton: {
    marginTop: spacing.md,
  },
});
