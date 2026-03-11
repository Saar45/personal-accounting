export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'expense' | 'income';
  category_id: number;
  description: string | null;
  date: string;
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
}

export interface CreateBillInput {
  name: string;
  amount: number;
  category_id: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  due_day: number;
  next_due_date: string;
}
