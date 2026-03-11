import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { CreateTransactionInput } from '../db/types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export interface ParsedCSVRow {
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
}

export interface CSVImportResult {
  rows: ParsedCSVRow[];
  errors: string[];
}

export async function pickAndParseCSV(): Promise<CSVImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const fileUri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(fileUri);

  return parseCSVContent(content);
}

export function parseCSVContent(content: string, dateFormat?: 'dmy' | 'mdy'): CSVImportResult {
  const parsed = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
  });

  const rows: ParsedCSVRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i] as Record<string, any>;

    const date = findField(row, ['date', 'datum', 'booking date', 'transaction date']);
    const description = findField(row, ['description', 'memo', 'reference', 'details', 'text', 'purpose']);
    const amountRaw = findField(row, ['amount', 'betrag', 'value', 'sum']);

    if (!date || amountRaw === undefined) {
      errors.push(`Row ${i + 1}: Missing date or amount`);
      continue;
    }

    const amount = typeof amountRaw === 'number'
      ? amountRaw
      : parseFloat(String(amountRaw).replace(',', '.').replace(/[^\d.-]/g, ''));

    if (isNaN(amount)) {
      errors.push(`Row ${i + 1}: Invalid amount "${amountRaw}"`);
      continue;
    }

    rows.push({
      date: normalizeDate(String(date), dateFormat),
      description: String(description || ''),
      amount: Math.abs(amount),
      type: amount < 0 ? 'expense' : 'income',
    });
  }

  return { rows, errors };
}

function findField(row: Record<string, any>, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return undefined;
}

function normalizeDate(dateStr: string, dateFormat?: 'dmy' | 'mdy'): string {
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try DD/MM/YYYY or DD.MM.YYYY or MM/DD/YYYY
  const match = dateStr.match(/^(\d{1,2})[/.,-](\d{1,2})[/.,-](\d{4})$/);
  if (match) {
    let [, first, second, year] = match;

    if (dateFormat === 'mdy') {
      // Explicit MM/DD/YYYY
      return `${year}-${first.padStart(2, '0')}-${second.padStart(2, '0')}`;
    }

    // Default to DD/MM/YYYY (European locale, consistent with EUR)
    let day = parseInt(first, 10);
    let month = parseInt(second, 10);

    // Smart detection: if "day" > 12, it must be month (swap)
    if (day > 12 && month <= 12) {
      // first is actually month, second is day — but we defaulted to DMY
      // No: if day > 12 in DMY, day is valid (e.g. 25/01/2024)
      // This is fine, day can be > 12
    }
    // If "month" > 12, it must be the day (input was MDY)
    if (month > 12 && day <= 12) {
      const tmp = day;
      day = month;
      month = tmp;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return dateStr;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['restaurant', 'food', 'grocery', 'supermarket', 'cafe', 'coffee', 'bakery', 'pizza', 'burger', 'sushi'],
  'Transport': ['fuel', 'gas', 'petrol', 'uber', 'taxi', 'train', 'bus', 'parking', 'toll'],
  'Housing': ['rent', 'mortgage', 'apartment'],
  'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'mobile'],
  'Entertainment': ['cinema', 'movie', 'theater', 'concert', 'game', 'sport'],
  'Shopping': ['amazon', 'shop', 'store', 'mall', 'clothing', 'clothes'],
  'Health': ['pharmacy', 'doctor', 'hospital', 'medicine', 'dental', 'gym', 'fitness'],
  'Subscriptions': ['netflix', 'spotify', 'apple', 'google', 'subscription', 'premium', 'membership'],
};

export function suggestCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'Other';
}

export function mapRowsToTransactions(
  rows: ParsedCSVRow[],
  categoryMap: Record<string, number>
): CreateTransactionInput[] {
  return rows.map((row) => {
    const suggestedCat = row.type === 'income' ? 'Other Income' : suggestCategory(row.description);
    const categoryId = categoryMap[suggestedCat] || categoryMap['Other'] || 1;

    return {
      amount: row.amount,
      type: row.type,
      category_id: categoryId,
      description: row.description,
      date: row.date,
    };
  });
}
