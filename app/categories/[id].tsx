import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  canDeleteCategory,
} from '../../src/db/categories';
import { useDatabase } from '../../src/hooks/useDatabase';
import CategoryForm from '../../src/components/CategoryForm';
import { Category, CreateCategoryInput } from '../../src/db/types';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady, triggerRefresh } = useDatabase();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !id) return;
    getCategoryById(Number(id)).then((data) => {
      setCategory(data);
      setLoading(false);
    });
  }, [isReady, id]);

  const handleSubmit = async (input: CreateCategoryInput) => {
    await updateCategory(Number(id), input);
    triggerRefresh();
    router.back();
  };

  const handleDelete = async () => {
    const result = await canDeleteCategory(Number(id));
    if (!result.canDelete) {
      const parts: string[] = [];
      if (result.transactionCount > 0) {
        parts.push(`${result.transactionCount} transaction${result.transactionCount > 1 ? 's' : ''}`);
      }
      if (result.billCount > 0) {
        parts.push(`${result.billCount} bill${result.billCount > 1 ? 's' : ''}`);
      }
      Alert.alert(
        'Cannot Delete',
        `This category is used by ${parts.join(' and ')}. Reassign them before deleting.`
      );
      return;
    }
    await deleteCategory(Number(id));
    triggerRefresh();
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Edit Category' }} />
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Category Not Found' }} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Category',
          headerStyle: { backgroundColor: '#0F0F13' },
          headerTintColor: '#FFFFFF',
        }}
      />
      <CategoryForm
        initialValues={{
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
        }}
        onSubmit={handleSubmit}
        onDelete={category.is_default === 0 ? handleDelete : undefined}
        submitLabel="Save Changes"
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
