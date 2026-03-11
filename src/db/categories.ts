import { getDatabase } from './database';
import { Category, CreateCategoryInput } from './types';

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY type, name');
}

export async function getCategoriesByType(type: 'expense' | 'income'): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>(
    'SELECT * FROM categories WHERE type = ? ORDER BY name',
    type
  );
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', id);
}

export async function createCategory(input: CreateCategoryInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO categories (name, icon, color, type, is_default) VALUES (?, ?, ?, ?, 0)',
    input.name,
    input.icon,
    input.color,
    input.type
  );
  return result.lastInsertRowId;
}

export async function updateCategory(id: number, input: CreateCategoryInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE categories SET name = ?, icon = ?, color = ?, type = ? WHERE id = ?',
    input.name,
    input.icon,
    input.color,
    input.type,
    id
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ? AND is_default = 0', id);
}

export async function canDeleteCategory(id: number): Promise<{
  canDelete: boolean;
  transactionCount: number;
  billCount: number;
}> {
  const db = await getDatabase();
  const txResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
    id
  );
  const billResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bills WHERE category_id = ?',
    id
  );
  const transactionCount = txResult?.count ?? 0;
  const billCount = billResult?.count ?? 0;
  return {
    canDelete: transactionCount === 0 && billCount === 0,
    transactionCount,
    billCount,
  };
}
