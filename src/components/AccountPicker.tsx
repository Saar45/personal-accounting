import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Account } from '../db/types';

interface AccountPickerProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  accounts: Account[];
}

export function AccountPicker({ selectedId, onSelect, accounts }: AccountPickerProps) {
  if (accounts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {accounts.map((account) => {
          const isSelected = account.id === selectedId;
          return (
            <TouchableOpacity
              key={account.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(account.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={account.icon as any}
                size={16}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {account.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
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
});
