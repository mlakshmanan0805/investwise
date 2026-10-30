/**
 * Formatting Utilities for InvestWise
 * Consistent Indian Rupee and financial numerical displays.
 */

export function formatINR(val, includeDecimals = true) {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Rs 0.00';
  }

  const num = Number(val);
  const isNegative = num < 0;
  const absVal = Math.abs(num);

  const parts = absVal.toFixed(includeDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  // Indian Rupee numbering format: 3 digits rightmost, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}Rs ${formattedInteger}${decimalPart}`;
}

export function formatPercentage(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) {
    return '0.00%';
  }
  const num = Number(val);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
