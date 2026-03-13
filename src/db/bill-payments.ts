import { getDatabase } from './database';
import { BillPayment, CreateBillPaymentInput } from './types';

export async function getPaymentsForBill(billId: number): Promise<BillPayment[]> {
  const db = await getDatabase();
  return db.getAllAsync<BillPayment>(
    'SELECT * FROM bill_payments WHERE bill_id = ? ORDER BY paid_date DESC',
    billId
  );
}

export async function createBillPayment(input: CreateBillPaymentInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO bill_payments (bill_id, amount, paid_date, currency) VALUES (?, ?, ?, ?)',
    input.bill_id,
    input.amount,
    input.paid_date,
    input.currency ?? 'EUR'
  );
  return result.lastInsertRowId;
}

export async function deleteBillPayment(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bill_payments WHERE id = ?', id);
}
