import { getDatabase } from './database';
import { Transaction, TransactionWithCategory, CreateTransactionInput } from './types';

export async function getAllTransactions(): Promise<TransactionWithCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<TransactionWithCategory>(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ORDER BY t.date DESC, t.created_at DESC
  `);
}

export async function getTransactionsByMonth(year: number, month: number): Promise<TransactionWithCategory[]> {
  const db = await getDatabase();
  const monthStr = String(month).padStart(2, '0');
  return db.getAllAsync<TransactionWithCategory>(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date LIKE ?
    ORDER BY t.date DESC, t.created_at DESC
  `, `${year}-${monthStr}%`);
}

export async function getTransactionById(id: number): Promise<TransactionWithCategory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<TransactionWithCategory>(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `, id);
}

export async function createTransaction(input: CreateTransactionInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO transactions (amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?)',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.date
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(id: number, input: CreateTransactionInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ? WHERE id = ?',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.date,
    id
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function getMonthlyTotals(year: number, month: number): Promise<{ income: number; expenses: number }> {
  const db = await getDatabase();
  const monthStr = String(month).padStart(2, '0');

  const income = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date LIKE ?",
    `${year}-${monthStr}%`
  );

  const expenses = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date LIKE ?",
    `${year}-${monthStr}%`
  );

  return {
    income: income?.total ?? 0,
    expenses: expenses?.total ?? 0,
  };
}

export async function getSpendingByCategory(year: number, month: number): Promise<Array<{
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}>> {
  const db = await getDatabase();
  const monthStr = String(month).padStart(2, '0');

  return db.getAllAsync(`
    SELECT t.category_id, c.name as category_name, c.icon as category_icon, c.color as category_color, SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.date LIKE ?
    GROUP BY t.category_id
    ORDER BY total DESC
  `, `${year}-${monthStr}%`);
}

export async function getTotalBalance(): Promise<{ income: number; expenses: number }> {
  const db = await getDatabase();

  const income = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'income'"
  );

  const expenses = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'"
  );

  return {
    income: income?.total ?? 0,
    expenses: expenses?.total ?? 0,
  };
}

export async function bulkCreateTransactions(inputs: CreateTransactionInput[]): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const input of inputs) {
      await txn.runAsync(
        'INSERT INTO transactions (amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?)',
        input.amount,
        input.type,
        input.category_id,
        input.description ?? null,
        input.date
      );
    }
  });
}
