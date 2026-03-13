import { SUPPORTED_CURRENCIES } from './currency';
import { getLatestRates, saveRates, getRateAge } from '../db/exchange-rates';
import { ExchangeRate } from '../db/types';

const FRANKFURTER_BASE = 'https://api.frankfurter.app';
const REFRESH_INTERVAL_HOURS = 12;

// Hardcoded EUR-based fallback rates for offline use.
// XOF has a fixed institutional peg to EUR (655.957).
const FALLBACK_EUR_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.97,
  CAD: 1.47,
  AUD: 1.66,
  JPY: 162.5,
  SEK: 11.2,
  NOK: 11.5,
  DKK: 7.46,
  PLN: 4.32,
  CZK: 25.3,
  TRY: 34.8,
  BRL: 5.35,
  INR: 90.5,
  XOF: 655.957,
};

export type RateMap = Map<string, number>;

export async function fetchRatesFromAPI(baseCurrency: string): Promise<{ date: string; rates: Record<string, number> } | null> {
  const targets = SUPPORTED_CURRENCIES
    .map((c) => c.code)
    .filter((c) => c !== baseCurrency)
    .join(',');

  try {
    const response = await fetch(
      `${FRANKFURTER_BASE}/latest?from=${baseCurrency}&to=${targets}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return { date: data.date, rates: data.rates };
  } catch {
    return null;
  }
}

export async function refreshRatesIfNeeded(baseCurrency: string): Promise<RateMap> {
  const age = await getRateAge();
  const needsRefresh = age === null || age > REFRESH_INTERVAL_HOURS;

  if (needsRefresh) {
    const result = await fetchRatesFromAPI(baseCurrency);
    if (result) {
      // Also include the base currency itself as rate 1
      result.rates[baseCurrency] = 1;
      await saveRates(baseCurrency, result.date, result.rates);
      return buildRateMap(baseCurrency, result.rates);
    }
  }

  // Load from cache
  return loadCachedRates(baseCurrency);
}

export async function loadCachedRates(baseCurrency: string): Promise<RateMap> {
  const cached = await getLatestRates(baseCurrency);
  if (cached.length > 0) {
    return buildRateMapFromRows(baseCurrency, cached);
  }
  // Ultimate fallback: use hardcoded rates
  return buildFallbackRateMap(baseCurrency);
}

export function buildRateMap(baseCurrency: string, rates: Record<string, number>): RateMap {
  const map = new Map<string, number>();
  map.set(baseCurrency, 1);
  for (const [currency, rate] of Object.entries(rates)) {
    map.set(currency, rate);
  }
  return map;
}

function buildRateMapFromRows(baseCurrency: string, rows: ExchangeRate[]): RateMap {
  const map = new Map<string, number>();
  map.set(baseCurrency, 1);
  for (const row of rows) {
    map.set(row.target_currency, row.rate);
  }
  return map;
}

function buildFallbackRateMap(baseCurrency: string): RateMap {
  const map = new Map<string, number>();
  const baseToEur = FALLBACK_EUR_RATES[baseCurrency] ?? 1;

  for (const [currency, eurRate] of Object.entries(FALLBACK_EUR_RATES)) {
    // Convert EUR-based rate to baseCurrency-based: rate = eurRate / baseToEur
    map.set(currency, eurRate / baseToEur);
  }
  map.set(baseCurrency, 1);
  return map;
}

export function convert(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rateMap: RateMap
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rateMap.get(fromCurrency);
  const toRate = rateMap.get(toCurrency);

  if (fromRate === undefined || toRate === undefined) return amount;

  // Cross-rate conversion: amount * (toRate / fromRate)
  return amount * (toRate / fromRate);
}
