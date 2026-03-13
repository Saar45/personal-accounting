import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../src/constants/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { createBudget } from '../../src/db/budgets';
import { getCategoriesByType } from '../../src/db/categories';
import { useDatabase } from '../../src/hooks/useDatabase';
import { useCurrency } from '../../src/hooks/useCurrency';
import { CurrencyPickerField } from '../../src/components/ui/CurrencyPickerField';
import { Category, CreateBudgetInput } from '../../src/db/types';

export default function NewBudgetScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();
  const { currency: displayCurrency } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrencyState] = useState(displayCurrency);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<{ category?: string; amount?: string }>({});

  useEffect(() => {
    getCategoriesByType('expense').then((cats) => {
      setCategories(cats);
      setCategoriesLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!selectedCategoryId) newErrors.category = 'Select a category';
    const amountNum = parseFloat(amount);
    if (!amount.trim() || isNaN(amountNum) || amountNum <= 0) newErrors.amount = 'Enter a valid amount';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createBudget({
        category_id: selectedCategoryId!,
        amount: parseFloat(amount),
        period,
        currency,
      });
      triggerRefresh();
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                  onPress={() => { setSelectedCategoryId(cat.id); setErrors((e) => ({ ...e, category: undefined })); }}
                  activeOpacity={0.7}
                >
                  <Badge icon={cat.icon} color={cat.color} size="sm" />
                  <Text
                    style={[styles.categoryName, isSelected && styles.categoryNameSelected]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <CurrencyPickerField
          label="Currency"
          value={currency}
          onChange={setCurrencyState}
        />

        <Input
          label="Budget Amount"
          value={amount}
          onChangeText={(v) => { setAmount(v); setErrors((e) => ({ ...e, amount: undefined })); }}
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.amount}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Period</Text>
          <View style={styles.periodRow}>
            {(['monthly', 'yearly'] as const).map((p) => {
              const isSelected = p === period;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodChip, isSelected && styles.periodChipSelected]}
                  onPress={() => setPeriod(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.periodText, isSelected && styles.periodTextSelected]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title="Create Budget"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  error: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
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
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    maxWidth: 100,
  },
  categoryNameSelected: {
    color: colors.primary,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  periodText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextSelected: {
    color: colors.primary,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
