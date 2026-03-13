import { parseCSVContent, suggestCategory, mapRowsToTransactions } from '../csv-import';

describe('parseCSVContent', () => {
  it('parses standard CSV with date,description,amount', () => {
    const csv = `date,description,amount
2026-01-15,Grocery store,-45.50
2026-01-16,Salary payment,3000`;

    const { rows, errors } = parseCSVContent(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      date: '2026-01-15',
      description: 'Grocery store',
      amount: 45.50,
      type: 'expense',
    });
    expect(rows[1]).toEqual({
      date: '2026-01-16',
      description: 'Salary payment',
      amount: 3000,
      type: 'income',
    });
  });

  it('parses German headers (datum, text, betrag)', () => {
    const csv = `datum,text,betrag
2026-01-15,Einkauf,-20`;

    const { rows, errors } = parseCSVContent(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe('Einkauf');
    expect(rows[0].type).toBe('expense');
  });

  it('handles European comma decimals as string', () => {
    // When amount is a string with European formatting, it gets cleaned up
    const csv = `date,description,amount
2026-01-15,Test,"-45,50"`;

    const { rows } = parseCSVContent(csv);
    expect(rows[0].amount).toBeCloseTo(45.50);
    expect(rows[0].type).toBe('expense');
  });

  it('normalizes DD/MM/YYYY dates', () => {
    const csv = `date,description,amount
15/01/2026,Test,-10`;

    const { rows } = parseCSVContent(csv);
    expect(rows[0].date).toBe('2026-01-15');
  });

  it('normalizes MM/DD/YYYY with explicit mdy format', () => {
    const csv = `date,description,amount
01/15/2026,Test,-10`;

    const { rows } = parseCSVContent(csv, 'mdy');
    expect(rows[0].date).toBe('2026-01-15');
  });

  it('smart-detects when month > 12 (MDY format with swapped fields)', () => {
    // 05/25/2026 — if parsed as DMY, month=25 > 12, so swap
    const csv = `date,description,amount
05/25/2026,Test,-10`;

    const { rows } = parseCSVContent(csv);
    expect(rows[0].date).toBe('2026-05-25');
  });

  it('reports error for missing date or amount', () => {
    const csv = `date,description,amount
,Test,`;

    const { rows, errors } = parseCSVContent(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Row 1');
  });

  it('reports error for invalid amount', () => {
    const csv = `date,description,amount
2026-01-15,Test,abc`;

    const { errors } = parseCSVContent(csv);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Invalid amount');
  });

  it('handles missing description gracefully', () => {
    const csv = `date,description,amount
2026-01-15,,50`;

    const { rows } = parseCSVContent(csv);
    expect(rows[0].description).toBe('');
  });

  it('stores absolute amounts', () => {
    const csv = `date,description,amount
2026-01-15,Expense,-100`;

    const { rows } = parseCSVContent(csv);
    expect(rows[0].amount).toBe(100);
  });
});

describe('suggestCategory', () => {
  it('matches Netflix to Subscriptions', () => {
    expect(suggestCategory('Netflix monthly')).toBe('Subscriptions');
  });

  it('matches Uber to Transport', () => {
    expect(suggestCategory('Uber ride home')).toBe('Transport');
  });

  it('matches grocery to Food', () => {
    expect(suggestCategory('grocery store')).toBe('Food');
  });

  it('returns Other for unknown', () => {
    expect(suggestCategory('random purchase xyz')).toBe('Other');
  });

  it('is case insensitive', () => {
    expect(suggestCategory('NETFLIX')).toBe('Subscriptions');
  });
});

describe('mapRowsToTransactions', () => {
  const categoryMap: Record<string, number> = {
    Food: 1,
    Transport: 2,
    Subscriptions: 3,
    Other: 4,
    'Other Income': 5,
  };

  it('maps expense rows with suggested categories', () => {
    const rows = [
      { date: '2026-01-15', description: 'grocery store', amount: 50, type: 'expense' as const },
    ];
    const result = mapRowsToTransactions(rows, categoryMap);
    expect(result[0].category_id).toBe(1); // Food
  });

  it('maps income rows to Other Income', () => {
    const rows = [
      { date: '2026-01-15', description: 'Salary', amount: 3000, type: 'income' as const },
    ];
    const result = mapRowsToTransactions(rows, categoryMap);
    expect(result[0].category_id).toBe(5); // Other Income
  });

  it('falls back to Other for unknown descriptions', () => {
    const rows = [
      { date: '2026-01-15', description: 'something random', amount: 20, type: 'expense' as const },
    ];
    const result = mapRowsToTransactions(rows, categoryMap);
    expect(result[0].category_id).toBe(4); // Other
  });
});
