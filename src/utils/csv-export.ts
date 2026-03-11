import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllTransactions } from '../db/transactions';

export async function exportTransactionsCSV(): Promise<void> {
  const transactions = await getAllTransactions();

  const rows = transactions.map((t) => ({
    Date: t.date,
    Description: t.description ?? '',
    Amount: t.type === 'expense' ? -t.amount : t.amount,
    Type: t.type,
    Category: t.category_name,
  }));

  const csv = Papa.unparse(rows);
  const filePath = FileSystem.cacheDirectory + 'transactions.csv';

  await FileSystem.writeAsStringAsync(filePath, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Transactions',
    UTI: 'public.comma-separated-values-text',
  });
}
