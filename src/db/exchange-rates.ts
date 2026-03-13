import { getDatabase } from './database';
import { ExchangeRate } from './types';

export async function getLatestRates(baseCurrency: string): Promise<ExchangeRate[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExchangeRate>(
    `SELECT * FROM exchange_rates
     WHERE base_currency = ? AND date = (
       SELECT MAX(date) FROM exchange_rates WHERE base_currency = ?
     )`,
    baseCurrency,
    baseCurrency
  );
}

export async function saveRates(
  baseCurrency: string,
  date: string,
  rates: Record<string, number>
): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const [target, rate] of Object.entries(rates)) {
      await txn.runAsync(
        `INSERT OR REPLACE INTO exchange_rates (base_currency, target_currency, rate, date)
         VALUES (?, ?, ?, ?)`,
        baseCurrency,
        target,
        rate,
        date
      );
    }
  });
}

export async function getRateAge(): Promise<number | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ fetched_at: string }>(
    'SELECT fetched_at FROM exchange_rates ORDER BY fetched_at DESC LIMIT 1'
  );
  if (!result) return null;
  const raw = result.fetched_at;
  const fetchedAt = new Date(raw.endsWith('Z') ? raw : raw + 'Z').getTime();
  const now = Date.now();
  return (now - fetchedAt) / (1000 * 60 * 60); // hours
}
