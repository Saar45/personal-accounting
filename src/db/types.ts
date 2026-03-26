export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: number;
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description: string | null;
  date: string;
  currency: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface Bill {
  id: number;
  name: string;
  amount: number;
  category_id: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  due_day: number;
  is_active: number;
  next_due_date: string;
  currency: string;
  created_at: string;
}

export interface BillWithCategory extends Bill {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description?: string;
  date: string;
  currency?: string;
}

export interface CreateBillInput {
  name: string;
  amount: number;
  category_id: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  due_day: number;
  next_due_date: string;
  currency?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  period: 'monthly' | 'yearly';
  currency: string;
  created_at: string;
}

export interface BudgetWithProgress extends Budget {
  category_name: string;
  category_icon: string;
  category_color: string;
  spent: number;
}

export interface BudgetProgressRow extends BudgetWithProgress {
  spentByCurrency: Array<{ currency: string; total: number }>;
}

export interface CreateBudgetInput {
  category_id: number;
  amount: number;
  period: 'monthly' | 'yearly';
  currency?: string;
}

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_occurrence: string;
  is_active: number;
  currency: string;
  created_at: string;
}

export interface RecurringTransactionWithCategory extends RecurringTransaction {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface CreateRecurringTransactionInput {
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_occurrence: string;
  currency?: string;
}

export interface BillPayment {
  id: number;
  bill_id: number;
  amount: number;
  paid_date: string;
  currency: string;
  created_at: string;
}

export interface CreateBillPaymentInput {
  bill_id: number;
  amount: number;
  paid_date: string;
  currency?: string;
}

export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: number;
  date: string;
  fetched_at: string;
}
