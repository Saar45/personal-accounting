import { getDatabase } from './database';
import { Category } from './types';

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
