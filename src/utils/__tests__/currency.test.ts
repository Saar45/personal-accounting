import { formatEUR, formatEURCompact, formatSignedEUR } from '../currency';

// Intl.NumberFormat with de-DE uses non-breaking space before €
function normalize(s: string): string {
  return s.replace(/\u00a0/g, ' ');
}

describe('formatEUR', () => {
  it('formats positive amounts', () => {
    expect(normalize(formatEUR(1234.56))).toBe('1.234,56 €');
  });

  it('formats zero', () => {
    expect(normalize(formatEUR(0))).toBe('0,00 €');
  });

  it('formats negative amounts', () => {
    expect(normalize(formatEUR(-50))).toBe('-50,00 €');
  });

  it('rounds to 2 decimals', () => {
    expect(normalize(formatEUR(9.999))).toBe('10,00 €');
  });
});

describe('formatEURCompact', () => {
  it('rounds to integer', () => {
    expect(normalize(formatEURCompact(1234.56))).toBe('1.235 €');
  });

  it('formats zero', () => {
    expect(normalize(formatEURCompact(0))).toBe('0 €');
  });
});

describe('formatSignedEUR', () => {
  it('adds + prefix for income', () => {
    const result = normalize(formatSignedEUR(100, 'income'));
    expect(result).toBe('+100,00 €');
  });

  it('adds - prefix for expense', () => {
    const result = normalize(formatSignedEUR(100, 'expense'));
    expect(result).toBe('-100,00 €');
  });
});
