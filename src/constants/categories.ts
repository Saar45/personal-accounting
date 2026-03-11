export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expense categories
  { name: 'Housing', icon: 'home-outline', color: '#6C5CE7', type: 'expense' },
  { name: 'Utilities', icon: 'flash-outline', color: '#FDCB6E', type: 'expense' },
  { name: 'Food', icon: 'restaurant-outline', color: '#FF6B6B', type: 'expense' },
  { name: 'Transport', icon: 'car-outline', color: '#00B894', type: 'expense' },
  { name: 'Entertainment', icon: 'game-controller-outline', color: '#E17055', type: 'expense' },
  { name: 'Shopping', icon: 'bag-outline', color: '#A29BFE', type: 'expense' },
  { name: 'Health', icon: 'heart-outline', color: '#FF6B6B', type: 'expense' },
  { name: 'Subscriptions', icon: 'refresh-outline', color: '#74B9FF', type: 'expense' },
  { name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#8E8E9A', type: 'expense' },

  // Income categories
  { name: 'Salary', icon: 'wallet-outline', color: '#00B894', type: 'income' },
  { name: 'Freelance', icon: 'laptop-outline', color: '#6C5CE7', type: 'income' },
  { name: 'Investment', icon: 'trending-up-outline', color: '#00B894', type: 'income' },
  { name: 'Other Income', icon: 'ellipsis-horizontal-outline', color: '#8E8E9A', type: 'income' },
];
