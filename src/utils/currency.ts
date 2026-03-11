const eurFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurCompactFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}

export function formatEURCompact(amount: number): string {
  return eurCompactFormatter.format(amount);
}

export function formatSignedEUR(amount: number, type: 'income' | 'expense'): string {
  const prefix = type === 'income' ? '+' : '-';
  return `${prefix}${eurFormatter.format(amount)}`;
}
