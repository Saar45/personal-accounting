import { getDatabase } from './database';
import { RecurringTransactionWithCategory, CreateRecurringTransactionInput } from './types';
import { createTransaction } from './transactions';
import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns';
import { getTodayISO } from '../utils/dates';

export async function getAllRecurring(): Promise<RecurringTransactionWithCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<RecurringTransactionWithCategory>(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM recurring_transactions r
    JOIN categories c ON r.category_id = c.id
    ORDER BY r.next_occurrence ASC
  `);
}

export async function getRecurringById(id: number): Promise<RecurringTransactionWithCategory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<RecurringTransactionWithCategory>(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM recurring_transactions r
    JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `, id);
}

export async function createRecurring(input: CreateRecurringTransactionInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO recurring_transactions (amount, type, category_id, description, frequency, next_occurrence, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.frequency,
    input.next_occurrence,
    input.currency ?? 'EUR'
  );
  return result.lastInsertRowId;
}

export async function updateRecurring(id: number, input: CreateRecurringTransactionInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE recurring_transactions SET amount = ?, type = ?, category_id = ?, description = ?, frequency = ?, next_occurrence = ?, currency = ? WHERE id = ?',
    input.amount,
    input.type,
    input.category_id,
    input.description ?? null,
    input.frequency,
    input.next_occurrence,
    input.currency ?? 'EUR',
    id
  );
}

export async function deleteRecurring(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', id);
}

function advanceDate(dateStr: string, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
  const date = parseISO(dateStr);
  let next: Date;
  switch (frequency) {
    case 'daily':
      next = addDays(date, 1);
      break;
    case 'weekly':
      next = addWeeks(date, 1);
      break;
    case 'monthly':
      next = addMonths(date, 1);
      break;
    case 'yearly':
      next = addYears(date, 1);
      break;
  }
  return format(next, 'yyyy-MM-dd');
}

export async function processRecurringTransactions(): Promise<number> {
  const db = await getDatabase();
  const today = getTodayISO();

  const dueRecurring = await db.getAllAsync<RecurringTransactionWithCategory>(`
    SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM recurring_transactions r
    JOIN categories c ON r.category_id = c.id
    WHERE r.is_active = 1 AND r.next_occurrence <= ?
  `, today);

  let count = 0;

  for (const rec of dueRecurring) {
    // Create the transaction
    await createTransaction({
      amount: rec.amount,
      type: rec.type,
      category_id: rec.category_id,
      description: rec.description ?? undefined,
      date: rec.next_occurrence,
      currency: rec.currency,
    });

    // Advance next_occurrence
    const nextDate = advanceDate(rec.next_occurrence, rec.frequency);
    await db.runAsync(
      'UPDATE recurring_transactions SET next_occurrence = ? WHERE id = ?',
      nextDate,
      rec.id
    );

    count++;
  }

  return count;
}
