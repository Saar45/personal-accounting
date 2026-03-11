import { getDatabase } from './database';
import { Budget, BudgetWithProgress, CreateBudgetInput } from './types';

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  return { start, end };
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  return db.getAllAsync<Budget>('SELECT * FROM budgets ORDER BY created_at DESC');
}

export async function getBudgetProgress(year: number, month: number): Promise<BudgetWithProgress[]> {
  const db = await getDatabase();
  const { start, end } = monthRange(year, month);

  return db.getAllAsync<BudgetWithProgress>(`
    SELECT
      b.*,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      COALESCE(SUM(
        CASE WHEN t.type = 'expense' AND t.date >= ? AND t.date < ? THEN t.amount ELSE 0 END
      ), 0) as spent
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t ON t.category_id = b.category_id
    GROUP BY b.id
    ORDER BY spent DESC
  `, start, end);
}

export async function createBudget(input: CreateBudgetInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO budgets (category_id, amount, period) VALUES (?, ?, ?)',
    input.category_id,
    input.amount,
    input.period
  );
  return result.lastInsertRowId;
}

export async function updateBudget(id: number, input: CreateBudgetInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE budgets SET category_id = ?, amount = ?, period = ? WHERE id = ?',
    input.category_id,
    input.amount,
    input.period,
    id
  );
}

export async function deleteBudget(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', id);
}
