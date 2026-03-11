import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Category } from '../db/types';

interface TransactionFiltersProps {
  selectedType: 'all' | 'expense' | 'income';
  onTypeChange: (type: 'all' | 'expense' | 'income') => void;
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (id: number | null) => void;
}

export function TransactionFilters({
  selectedType,
  onTypeChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
}: TransactionFiltersProps) {
  const typeChips: Array<{ label: string; value: 'all' | 'expense' | 'income' }> = [
    { label: 'All', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {typeChips.map((chip) => (
        <TouchableOpacity
          key={chip.value}
          style={[styles.chip, selectedType === chip.value && styles.chipSelected]}
          onPress={() => onTypeChange(chip.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selectedType === chip.value && styles.chipTextSelected]}>
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}

      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.chip, selectedCategoryId === cat.id && styles.chipSelected]}
          onPress={() => onCategoryChange(selectedCategoryId === cat.id ? null : cat.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextSelected]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
  },
});
