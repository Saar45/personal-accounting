import { exportTransactionsCSV } from '../csv-export';
import { getAllTransactions } from '../../db/transactions';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

jest.mock('../../db/transactions', () => ({
  getAllTransactions: jest.fn(),
}));

const mockGetAll = getAllTransactions as jest.MockedFunction<typeof getAllTransactions>;
const mockWrite = FileSystem.writeAsStringAsync as jest.MockedFunction<typeof FileSystem.writeAsStringAsync>;
const mockShare = Sharing.shareAsync as jest.MockedFunction<typeof Sharing.shareAsync>;

describe('exportTransactionsCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports correct CSV with negated expenses', async () => {
    mockGetAll.mockResolvedValue([
      {
        id: 1, amount: 50, type: 'expense', category_id: 1, date: '2026-01-15',
        description: 'Groceries', created_at: '', category_name: 'Food',
        category_icon: 'restaurant-outline', category_color: '#FF6B6B',
      },
      {
        id: 2, amount: 3000, type: 'income', category_id: 2, date: '2026-01-16',
        description: 'Salary', created_at: '', category_name: 'Salary',
        category_icon: 'wallet-outline', category_color: '#00B894',
      },
    ]);

    await exportTransactionsCSV();

    expect(mockWrite).toHaveBeenCalledTimes(1);
    const csvContent = mockWrite.mock.calls[0][1];
    expect(csvContent).toContain('Date,Description,Amount,Type,Category');
    expect(csvContent).toContain('-50');
    expect(csvContent).toContain('3000');
  });

  it('calls shareAsync with correct params', async () => {
    mockGetAll.mockResolvedValue([]);

    await exportTransactionsCSV();

    expect(mockShare).toHaveBeenCalledWith(
      '/mock-cache/transactions.csv',
      expect.objectContaining({ mimeType: 'text/csv' })
    );
  });
});
