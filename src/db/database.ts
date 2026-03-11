import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '../constants/categories';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('personal_accounting.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      is_default INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      category_id INTEGER NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'yearly')),
      due_day INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      next_due_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  await seedDefaultCategories(db);

  return db;
}

async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );

  if (existing && existing.count > 0) return;

  for (const cat of DEFAULT_CATEGORIES) {
    await database.runAsync(
      'INSERT INTO categories (name, icon, color, type, is_default) VALUES (?, ?, ?, ?, 1)',
      cat.name,
      cat.icon,
      cat.color,
      cat.type
    );
  }
}
