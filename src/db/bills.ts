import { getDatabase } from './database';
import { Bill, BillWithCategory, CreateBillInput } from './types';
import { computeNextDueDate } from '../utils/dates';

export async function getAllBills(): Promise<BillWithCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<BillWithCategory>(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM bills b
    JOIN categories c ON b.category_id = c.id
    ORDER BY b.next_due_date ASC
  `);
}

export async function getActiveBills(): Promise<BillWithCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<BillWithCategory>(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM bills b
    JOIN categories c ON b.category_id = c.id
    WHERE b.is_active = 1
    ORDER BY b.next_due_date ASC
  `);
}

export async function getUpcomingBills(limit: number = 3): Promise<BillWithCategory[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return db.getAllAsync<BillWithCategory>(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM bills b
    JOIN categories c ON b.category_id = c.id
    WHERE b.is_active = 1 AND b.next_due_date >= ?
    ORDER BY b.next_due_date ASC
    LIMIT ?
  `, today, limit);
}

export async function getBillById(id: number): Promise<BillWithCategory | null> {
  const db = await getDatabase();
  return db.getFirstAsync<BillWithCategory>(`
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM bills b
    JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `, id);
}

export async function createBill(input: CreateBillInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO bills (name, amount, category_id, frequency, due_day, next_due_date) VALUES (?, ?, ?, ?, ?, ?)',
    input.name,
    input.amount,
    input.category_id,
    input.frequency,
    input.due_day,
    input.next_due_date
  );
  return result.lastInsertRowId;
}

export async function updateBill(id: number, input: CreateBillInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE bills SET name = ?, amount = ?, category_id = ?, frequency = ?, due_day = ?, next_due_date = ? WHERE id = ?',
    input.name,
    input.amount,
    input.category_id,
    input.frequency,
    input.due_day,
    input.next_due_date,
    id
  );
}

export async function toggleBillActive(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE bills SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
    id
  );
}

export async function deleteBill(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bills WHERE id = ?', id);
}

export async function getMonthlyBillsTotal(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number | null }>(`
    SELECT SUM(
      CASE frequency
        WHEN 'weekly' THEN amount * 365.25 / 7.0 / 12.0
        WHEN 'monthly' THEN amount
        WHEN 'yearly' THEN amount / 12.0
      END
    ) as total
    FROM bills
    WHERE is_active = 1
  `);
  return result?.total ?? 0;
}

export async function refreshBillDueDates(): Promise<void> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const overdueBills = await db.getAllAsync<Bill>(
    'SELECT * FROM bills WHERE is_active = 1 AND next_due_date < ?',
    today
  );

  for (const bill of overdueBills) {
    const nextDate = computeNextDueDate(bill.frequency, bill.due_day);
    await db.runAsync(
      'UPDATE bills SET next_due_date = ? WHERE id = ?',
      nextDate,
      bill.id
    );
  }
}
