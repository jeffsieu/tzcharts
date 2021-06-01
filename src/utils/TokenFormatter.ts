import BigNumber from 'bignumber.js';

export function formatAmount(amount: BigNumber, decimals: number | null): string {
  const formatOptions: Intl.NumberFormatOptions = decimals ? {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  } : {
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 3,
  }
  return amount.toNumber().toLocaleString(navigator.language, formatOptions);
}

export function formatTezosAmount(amount: BigNumber): string {
  return formatAmount(amount, 6) + ' tez';
}

export function formatUsdAmount(amount: BigNumber, isSmallAmount = false): string {
  return '$' + formatAmount(amount, isSmallAmount ? null : 2);
}