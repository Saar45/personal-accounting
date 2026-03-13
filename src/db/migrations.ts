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
    up: async (_db) => {
      // F3: Allow custom categories
      // No schema change needed - is_default already distinguishes
    },
  },
  {
    version: 4,
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
    version: 5,
    up: async (db) => {
      // F7: Recurring transactions
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS recurring_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
          category_id INTEGER NOT NULL,
          description TEXT,
          frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
          next_occurrence TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );
      `);
    },
  },
  {
    version: 6,
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
  {
    version: 7,
    up: async (db) => {
      // Multi-currency: add currency column to all entity tables
      // Each ALTER TABLE must run separately — batching fails in expo-sqlite
      // try/catch for idempotency in case of partial prior run (duplicate column is safe to ignore)
      const tables = ['transactions', 'bills', 'recurring_transactions', 'budgets', 'bill_payments'];
      for (const table of tables) {
        try {
          await db.runAsync(`ALTER TABLE ${table} ADD COLUMN currency TEXT NOT NULL DEFAULT 'EUR'`);
        } catch (e: any) {
          if (!e?.message?.includes('duplicate column')) throw e;
        }
      }

      // Exchange rate cache table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exchange_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_currency TEXT NOT NULL,
          target_currency TEXT NOT NULL,
          rate REAL NOT NULL,
          date TEXT NOT NULL,
          fetched_at TEXT DEFAULT (datetime('now')),
          UNIQUE(base_currency, target_currency, date)
        );
      `);
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_date ON exchange_rates(base_currency, date)'
      );
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
