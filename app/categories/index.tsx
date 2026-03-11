import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../src/hooks/useCategories';
import { Category } from '../../src/db/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, loading } = useCategories();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const renderCategory = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryRow}
      onPress={() => router.push(`/categories/${category.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBadge, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={20} color={category.color} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      {category.is_default === 0 && (
        <View style={styles.customBadge}>
          <Text style={styles.customBadgeText}>Custom</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color="#5C5C6E" />
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: Category[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((category, index) => (
          <View key={category.id}>
            {renderCategory(category)}
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Categories' }} />
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Categories',
          headerStyle: { backgroundColor: '#0F0F13' },
          headerTintColor: '#FFFFFF',
        }}
      />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderSection('Expenses', expenseCategories)}
            {renderSection('Income', incomeCategories)}
            <View style={styles.bottomSpacer} />
          </>
        }
        contentContainerStyle={styles.content}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/categories/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#1A1A23',
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  customBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A29BFE',
  },
  separator: {
    height: 1,
    backgroundColor: '#2A2A35',
    marginLeft: 68,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
