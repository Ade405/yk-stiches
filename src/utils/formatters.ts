export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1, prefix: true },
  NGN: { symbol: '₦', rate: 1550, prefix: true },
  GBP: { symbol: '£', rate: 0.79, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: true },
};

export function formatPrice(amountInUSD: number, currency: string = 'USD'): string {
  const code = currency?.toUpperCase() || 'USD';
  const config = CURRENCY_RATES[code] || CURRENCY_RATES.USD;
  const converted = amountInUSD * config.rate;
  
  if (code === 'NGN') {
    return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  }
  
  return `${config.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
