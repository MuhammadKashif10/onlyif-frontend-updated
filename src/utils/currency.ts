/**
 * Global currency utility functions for AUD formatting
 */

// Default currency configuration
export const CURRENCY_CONFIG = {
  currency: 'AUD',
  locale: 'en-AU',
  symbol: 'A$'
} as const;

/**
 * Format a number as AUD currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "A$1,500.00")
 */
export function formatCurrency(
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  const formatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  // Replace $ with A$ to ensure Australian dollar symbol is displayed
  return formatter.format(amount).replace('$', 'A$');
}

/**
 * Format currency without decimal places for whole numbers
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "A$1,500")
 */
export function formatCurrencyCompact(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Price on Request';
  }
  
  const formatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Replace $ with A$ to ensure Australian dollar symbol is displayed
  return formatter.format(amount).replace('$', 'A$');
}

/**
 * Format currency for display in tables or compact spaces
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return formatCurrency(amount / 1000000, { maximumFractionDigits: 1 }) + 'M';
  }
  if (amount >= 1000) {
    return formatCurrency(amount / 1000, { maximumFractionDigits: 0 }) + 'K';
  }
  return formatCurrencyCompact(amount);
}

/**
 * Get the currency symbol
 * @returns Currency symbol (A$)
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Get the currency code
 * @returns Currency code (AUD)
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.currency;
}

/**
 * Convert cents to dollars and format as currency
 * @param cents - Amount in cents
 * @returns Formatted currency string
 */
export function formatCentsAsCurrency(cents: number): string {
  return formatCurrency(cents / 100);
}

/**
 * Convert dollars to cents for payment processing
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}