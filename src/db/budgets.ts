import { getDatabase } from './database';
import { Budget, BudgetWithProgress, BudgetProgressRow, CreateBudgetInput } from './types';

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

interface BudgetSpentRow {
  budget_id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  amount: number;
  period: 'monthly' | 'yearly';
  currency: string;
  created_at: string;
  spent_currency: string;
  spent_total: number;
}

export async function getBudgetProgress(year: number, month: number): Promise<BudgetProgressRow[]> {
  const db = await getDatabase();
  const { start, end } = monthRange(year, month);

  // Get budgets with spending grouped by currency for conversion
  const rows = await db.getAllAsync<BudgetSpentRow>(`
    SELECT
      b.id as budget_id,
      b.category_id,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color,
      b.amount,
      b.period,
      b.currency,
      b.created_at,
      COALESCE(t.currency, b.currency) as spent_currency,
      COALESCE(SUM(
        CASE WHEN t.type = 'expense' AND t.date >= ? AND t.date < ? THEN t.amount ELSE 0 END
      ), 0) as spent_total
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t ON t.category_id = b.category_id
    GROUP BY b.id, t.currency
    ORDER BY spent_total DESC
  `, start, end);

  // Group by budget and return raw data (conversion done in hook)
  const budgetMap = new Map<number, BudgetProgressRow>();
  for (const row of rows) {
    if (!budgetMap.has(row.budget_id)) {
      budgetMap.set(row.budget_id, {
        id: row.budget_id,
        category_id: row.category_id,
        category_name: row.category_name,
        category_icon: row.category_icon,
        category_color: row.category_color,
        amount: row.amount,
        period: row.period,
        currency: row.currency,
        created_at: row.created_at,
        spent: 0,
        spentByCurrency: [],
      });
    }
    const budget = budgetMap.get(row.budget_id)!;
    if (row.spent_total > 0) {
      budget.spentByCurrency.push({ currency: row.spent_currency, total: row.spent_total });
    }
  }

  return Array.from(budgetMap.values());
}

export async function createBudget(input: CreateBudgetInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO budgets (category_id, amount, period, currency) VALUES (?, ?, ?, ?)',
    input.category_id,
    input.amount,
    input.period,
    input.currency ?? 'EUR'
  );
  return result.lastInsertRowId;
}

export async function updateBudget(id: number, input: CreateBudgetInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE budgets SET category_id = ?, amount = ?, period = ?, currency = ? WHERE id = ?',
    input.category_id,
    input.amount,
    input.period,
    input.currency ?? 'EUR',
    id
  );
}

export async function deleteBudget(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', id);
}
