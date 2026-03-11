import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { createCategory } from '../../src/db/categories';
import { useDatabase } from '../../src/hooks/useDatabase';
import CategoryForm from '../../src/components/CategoryForm';
import { CreateCategoryInput } from '../../src/db/types';

export default function NewCategoryScreen() {
  const router = useRouter();
  const { triggerRefresh } = useDatabase();

  const handleSubmit = async (input: CreateCategoryInput) => {
    await createCategory(input);
    triggerRefresh();
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Category',
          headerStyle: { backgroundColor: '#0F0F13' },
          headerTintColor: '#FFFFFF',
        }}
      />
      <CategoryForm submitLabel="Create Category" onSubmit={handleSubmit} />
    </>
  );
}
