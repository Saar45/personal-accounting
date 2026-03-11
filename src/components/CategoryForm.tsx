import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { CreateCategoryInput } from '../db/types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import IconPicker from './IconPicker';
import ColorPicker from './ColorPicker';

interface CategoryFormProps {
  initialValues?: {
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income';
  };
  onSubmit: (input: CreateCategoryInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export default function CategoryForm({
  initialValues,
  onSubmit,
  onDelete,
  submitLabel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [icon, setIcon] = useState(initialValues?.icon ?? 'home-outline');
  const [color, setColor] = useState(initialValues?.color ?? '#6C5CE7');
  const [type, setType] = useState<'expense' | 'income'>(initialValues?.type ?? 'expense');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a category name.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), icon, color, type });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await onDelete();
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Category name"
      />

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.typeText, type === 'expense' && styles.typeTextActive]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
            onPress={() => setType('income')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.typeText, type === 'income' && styles.typeTextActive]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <IconPicker selectedIcon={icon} onSelect={setIcon} />
      </View>

      <View style={styles.section}>
        <ColorPicker selectedColor={color} onSelect={setColor} />
      </View>

      <View style={styles.section}>
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>

      {onDelete && (
        <View style={styles.section}>
          <Button
            title="Delete Category"
            onPress={handleDelete}
            variant="danger"
            loading={submitting}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1A1A23',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  typeButtonActiveIncome: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5C5C6E',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
});
