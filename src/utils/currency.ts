export interface SupportedCurrency {
  code: string;
  name: string;
  locale: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: 'EUR', name: 'Euro', locale: 'de-DE', symbol: '€' },
  { code: 'USD', name: 'US Dollar', locale: 'en-US', symbol: '$' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', locale: 'sv-SE', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', locale: 'nb-NO', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', locale: 'da-DK', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', locale: 'pl-PL', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', locale: 'cs-CZ', symbol: 'Kč' },
  { code: 'TRY', name: 'Turkish Lira', locale: 'tr-TR', symbol: '₺' },
  { code: 'BRL', name: 'Brazilian Real', locale: 'pt-BR', symbol: 'R$' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN', symbol: '₹' },
  { code: 'XOF', name: 'West African CFA Franc', locale: 'fr-SN', symbol: 'CFA' },
];

export interface CurrencyFormatters {
  format: (amount: number) => string;
  formatCompact: (amount: number) => string;
  formatSigned: (amount: number, type: 'income' | 'expense') => string;
}

export function createFormatters(currencyCode: string): CurrencyFormatters {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const compactFormatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return {
    format: (amount: number) => formatter.format(amount),
    formatCompact: (amount: number) => compactFormatter.format(amount),
    formatSigned: (amount: number, type: 'income' | 'expense') => {
      const prefix = type === 'income' ? '+' : '-';
      return `${prefix}${formatter.format(amount)}`;
    },
  };
}

