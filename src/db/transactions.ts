import { getDatabase } from './database';
import { Transaction, TransactionWithCategory, CreateTransactionInput } from './types';

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  return { start, end };
}

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
  const { start, end } = monthRange(year, month);
  return db.getAllAsync<TransactionWithCategory>(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.date >= ? AND t.date < ?
    ORDER BY t.date DESC, t.created_at DESC
  `, start, end);
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
    'INSERT INTO transactions (amount, type, category_id, description, date, currency) VALUES (?, ?, ?, ?, ?, ?)',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.date,
    input.currency ?? 'EUR'
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(id: number, input: CreateTransactionInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ?, currency = ? WHERE id = ?',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.date,
    input.currency ?? 'EUR',
    id
  );
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

// BF5: Monthly totals grouped by currency for conversion
export async function getMonthlyTotals(year: number, month: number): Promise<Array<{
  type: 'income' | 'expense';
  currency: string;
  total: number;
}>> {
  const db = await getDatabase();
  const { start, end } = monthRange(year, month);

  return db.getAllAsync(`
    SELECT type, currency, SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND date < ?
    GROUP BY type, currency
  `, start, end);
}

export async function getSpendingByCategory(year: number, month: number): Promise<Array<{
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  currency: string;
  total: number;
}>> {
  const db = await getDatabase();
  const { start, end } = monthRange(year, month);

  return db.getAllAsync(`
    SELECT t.category_id, c.name as category_name, c.icon as category_icon, c.color as category_color, t.currency, SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.date >= ? AND t.date < ?
    GROUP BY t.category_id, t.currency
    ORDER BY total DESC
  `, start, end);
}

// BF5: Total balance grouped by currency for conversion
export async function getTotalBalance(): Promise<Array<{
  type: 'income' | 'expense';
  currency: string;
  total: number;
}>> {
  const db = await getDatabase();

  return db.getAllAsync(`
    SELECT type, currency, SUM(amount) as total
    FROM transactions
    GROUP BY type, currency
  `);
}

export async function bulkCreateTransactions(inputs: CreateTransactionInput[]): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const input of inputs) {
      await txn.runAsync(
        'INSERT INTO transactions (amount, type, category_id, description, date, currency) VALUES (?, ?, ?, ?, ?, ?)',
        input.amount,
        input.type,
        input.category_id,
        input.description ?? null,
        input.date,
        input.currency ?? 'EUR'
      );
    }
  });
}

// F2: Search transactions with filters
export interface SearchTransactionsParams {
  query?: string;
  type?: 'expense' | 'income';
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function searchTransactions(params: SearchTransactionsParams): Promise<TransactionWithCategory[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const args: any[] = [];

  if (params.query) {
    conditions.push('t.description LIKE ?');
    args.push(`%${params.query}%`);
  }
  if (params.type) {
    conditions.push('t.type = ?');
    args.push(params.type);
  }
  if (params.categoryId) {
    conditions.push('t.category_id = ?');
    args.push(params.categoryId);
  }
  if (params.dateFrom) {
    conditions.push('t.date >= ?');
    args.push(params.dateFrom);
  }
  if (params.dateTo) {
    conditions.push('t.date < ?');
    args.push(params.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return db.getAllAsync<TransactionWithCategory>(`
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ${whereClause}
    ORDER BY t.date DESC, t.created_at DESC
  `, ...args);
}
