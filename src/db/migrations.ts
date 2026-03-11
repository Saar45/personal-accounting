import * as SQLite from 'expo-sqlite';

interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      // BF3: Database indexes for performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);
        CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
        CREATE INDEX IF NOT EXISTS idx_bills_is_active ON bills(is_active, next_due_date);
        CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
      `);
    },
  },
  {
    version: 2,
    up: async (db) => {
      // BF1: Fix category color collisions
      await db.runAsync(
        "UPDATE categories SET color = ? WHERE name = 'Health' AND is_default = 1",
        '#E84393'
      );
      await db.runAsync(
        "UPDATE categories SET color = ? WHERE name = 'Shopping' AND is_default = 1",
        '#FDA7DF'
      );
    },
  },
  {
    version: 3,
    up: async (db) => {
      // F3: Allow custom categories (add is_custom column)
      // No schema change needed - is_default already distinguishes
    },
  },
  {
    version: 4,
    up: async (db) => {
      // F4: Multiple accounts
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('checking', 'savings', 'cash', 'credit', 'investment')),
          icon TEXT NOT NULL DEFAULT 'wallet-outline',
          color TEXT NOT NULL DEFAULT '#6C5CE7',
          initial_balance REAL DEFAULT 0,
          is_default INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);
      // Add account_id column to transactions
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN account_id INTEGER REFERENCES accounts(id);
      `);
      // Insert default account
      await db.runAsync(
        "INSERT INTO accounts (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, 1)",
        'Main Account', 'checking', 'wallet-outline', '#6C5CE7'
      );
      // Link existing transactions to default account
      await db.execAsync(`
        UPDATE transactions SET account_id = (SELECT id FROM accounts WHERE is_default = 1);
      `);
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
      `);
    },
  },
  {
    version: 5,
    up: async (db) => {
      // F5: Budgets per category
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL UNIQUE,
          amount REAL NOT NULL,
          period TEXT NOT NULL CHECK(period IN ('monthly', 'yearly')),
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );
      `);
    },
  },
  {
    version: 6,
    up: async (db) => {
      // F7: Recurring transactions
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS recurring_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
          category_id INTEGER NOT NULL,
          account_id INTEGER,
          description TEXT,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
          next_occurrence TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (category_id) REFERENCES categories(id),
          FOREIGN KEY (account_id) REFERENCES accounts(id)
        );
      `);
    },
  },
  {
    version: 7,
    up: async (db) => {
      // F8: Transfer transactions
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN is_transfer INTEGER DEFAULT 0;
      `);
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN linked_transaction_id INTEGER;
      `);
    },
  },
  {
    version: 8,
    up: async (db) => {
      // F10: Bill payment tracking
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS bill_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          paid_date TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (bill_id) REFERENCES bills(id)
        );
      `);
    },
  },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
