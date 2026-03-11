import { getDatabase } from './database';
import { Account, CreateAccountInput } from './types';

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDatabase();
  return db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY is_default DESC, name ASC');
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', id);
}

export async function createAccount(input: CreateAccountInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO accounts (name, type, icon, color, initial_balance, is_default) VALUES (?, ?, ?, ?, ?, 0)',
    input.name,
    input.type,
    input.icon,
    input.color,
    input.initial_balance
  );
  return result.lastInsertRowId;
}

export async function updateAccount(id: number, input: CreateAccountInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE accounts SET name = ?, type = ?, icon = ?, color = ?, initial_balance = ? WHERE id = ?',
    input.name,
    input.type,
    input.icon,
    input.color,
    input.initial_balance,
    id
  );
}

export async function deleteAccount(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM accounts WHERE id = ? AND is_default = 0', id);
}

export async function getAccountBalance(id: number): Promise<number> {
  const db = await getDatabase();
  const account = await db.getFirstAsync<{ initial_balance: number }>(
    'SELECT initial_balance FROM accounts WHERE id = ?',
    id
  );
  if (!account) return 0;

  const result = await db.getFirstAsync<{ income: number; expenses: number }>(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions
    WHERE account_id = ?
  `, id);

  return account.initial_balance + (result?.income ?? 0) - (result?.expenses ?? 0);
}

export async function getDefaultAccount(): Promise<Account | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Account>('SELECT * FROM accounts WHERE is_default = 1');
}
