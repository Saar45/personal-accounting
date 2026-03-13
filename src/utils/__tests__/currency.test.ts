import { createFormatters, SUPPORTED_CURRENCIES } from '../currency';

// Intl.NumberFormat with de-DE uses non-breaking space before €
function normalize(s: string): string {
  return s.replace(/\u00a0/g, ' ');
}

describe('createFormatters', () => {
  describe('EUR', () => {
    const { format, formatCompact, formatSigned } = createFormatters('EUR');

    it('formats positive amounts', () => {
      expect(normalize(format(1234.56))).toBe('1.234,56 €');
    });

    it('formats zero', () => {
      expect(normalize(format(0))).toBe('0,00 €');
    });

    it('formats negative amounts', () => {
      expect(normalize(format(-50))).toBe('-50,00 €');
    });

    it('rounds to 2 decimals', () => {
      expect(normalize(format(9.999))).toBe('10,00 €');
    });

    it('formatCompact rounds to integer', () => {
      expect(normalize(formatCompact(1234.56))).toBe('1.235 €');
    });

    it('formatCompact formats zero', () => {
      expect(normalize(formatCompact(0))).toBe('0 €');
    });

    it('formatSigned adds + prefix for income', () => {
      expect(normalize(formatSigned(100, 'income'))).toBe('+100,00 €');
    });

    it('formatSigned adds - prefix for expense', () => {
      expect(normalize(formatSigned(100, 'expense'))).toBe('-100,00 €');
    });
  });

  describe('USD', () => {
    const { format, formatCompact, formatSigned } = createFormatters('USD');

    it('formats amount with dollar sign', () => {
      expect(format(1234.56)).toBe('$1,234.56');
    });

    it('formatCompact rounds to integer', () => {
      expect(formatCompact(1234.56)).toBe('$1,235');
    });

    it('formatSigned adds + prefix for income', () => {
      expect(formatSigned(100, 'income')).toBe('+$100.00');
    });

    it('formatSigned adds - prefix for expense', () => {
      expect(formatSigned(100, 'expense')).toBe('-$100.00');
    });
  });

  describe('GBP', () => {
    const { format } = createFormatters('GBP');

    it('formats amount with pound sign', () => {
      expect(format(1234.56)).toBe('£1,234.56');
    });
  });

  describe('JPY', () => {
    const { format } = createFormatters('JPY');

    it('formats yen amounts', () => {
      const result = format(1234);
      expect(result).toContain('1,234');
      expect(result).toMatch(/[¥￥]/);
    });
  });

  it('falls back to EUR for unknown currency code', () => {
    const { format } = createFormatters('INVALID');
    expect(normalize(format(100))).toBe('100,00 €');
  });
});

describe('SUPPORTED_CURRENCIES', () => {
  it('has at least 15 currencies', () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(15);
  });

  it('has EUR as the first currency', () => {
    expect(SUPPORTED_CURRENCIES[0].code).toBe('EUR');
  });

  it('each currency has required fields', () => {
    for (const c of SUPPORTED_CURRENCIES) {
      expect(c.code).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.locale).toBeTruthy();
      expect(c.symbol).toBeTruthy();
    }
  });

  it('has no duplicate codes', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
