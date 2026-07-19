export const AVAILABLE_CURRENCIES = [
  { code: 'UAH', label: 'UAH ₴' },
  { code: 'USD', label: 'USD $' },
  { code: 'EUR', label: 'EUR €' },
] as const;

export type LiqPayCurrency = (typeof AVAILABLE_CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY: LiqPayCurrency = 'UAH';

export const isLiqPayCurrency = (value: unknown): value is LiqPayCurrency =>
  typeof value === 'string' && AVAILABLE_CURRENCIES.some(currency => currency.code === value);
