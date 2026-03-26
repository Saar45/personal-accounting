import { TransactionWithCategory, Category, BillWithCategory, BudgetWithProgress } from '../../db/types';

export function mockTransaction(overrides: Partial<TransactionWithCategory> = {}): TransactionWithCategory {
  return {
    id: 1,
    amount: 50,
    type: 'expense',
    category_id: 1,
    description: 'Grocery store',
    date: '2026-03-13',
    created_at: '2026-03-13T10:00:00Z',
    category_name: 'Food',
    category_icon: 'restaurant-outline',
    category_color: '#FF6B6B',
    ...overrides,
  };
}

export function mockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name: 'Food',
    icon: 'restaurant-outline',
    color: '#FF6B6B',
    type: 'expense',
    is_default: 1,
    ...overrides,
  };
}

export function mockBill(overrides: Partial<BillWithCategory> = {}): BillWithCategory {
  return {
    id: 1,
    name: 'Rent',
    amount: 800,
    category_id: 1,
    frequency: 'monthly',
    due_day: 1,
    next_due_date: '2026-04-01',
    is_active: 1,
    created_at: '2026-03-01T00:00:00Z',
    category_name: 'Housing',
    category_icon: 'home-outline',
    category_color: '#6C5CE7',
    ...overrides,
  };
}

export function mockBudgetWithProgress(overrides: Partial<BudgetWithProgress> = {}): BudgetWithProgress {
  return {
    id: 1,
    category_id: 1,
    amount: 500,
    period: 'monthly',
    created_at: '2026-03-01T00:00:00Z',
    category_name: 'Food',
    category_icon: 'restaurant-outline',
    category_color: '#FF6B6B',
    spent: 200,
    ...overrides,
  };
}

export const mockFormatAmount = jest.fn((amount: number) => `€${amount.toFixed(2)}`);
export const mockFormatCompact = jest.fn((amount: number) => `€${Math.round(amount)}`);
export const mockFormatSigned = jest.fn((amount: number, type: string) =>
  type === 'income' ? `+€${amount.toFixed(2)}` : `-€${amount.toFixed(2)}`
);
