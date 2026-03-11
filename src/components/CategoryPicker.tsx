import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../constants/theme';
import { Category } from '../db/types';
import { getCategoriesByType } from '../db/categories';

interface CategoryPickerProps {
  type: 'expense' | 'income';
  selectedId: number | null;
  onSelect: (category: Category) => void;
}

export function CategoryPicker({ type, selectedId, onSelect }: CategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategoriesByType(type).then(setCategories);
  }, [type]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CATEGORY</Text>
      <FlatList
        data={categories}
        numColumns={4}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: item.color + '20' },
                isSelected && { backgroundColor: item.color + '40' },
              ]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
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
    letterSpacing: 0.5,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nameSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
