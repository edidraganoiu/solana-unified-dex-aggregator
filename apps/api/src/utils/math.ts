import Decimal from 'decimal.js';

const stripTrailingZeros = (value: string): string => {
  if (!value.includes('.')) {
    return value;
  }

  return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};

export const toAtomic = (amount: string | number, decimals: number): string => {
  return new Decimal(amount)
    .mul(new Decimal(10).pow(decimals))
    .floor()
    .toFixed(0);
};

export const toUi = (atomic: string | number, decimals: number): string => {
  const result = new Decimal(atomic).div(new Decimal(10).pow(decimals));
  return stripTrailingZeros(result.toFixed(decimals));
};
