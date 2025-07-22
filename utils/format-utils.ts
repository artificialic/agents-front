/**
 * Formats a number as Colombian currency (COP)
 * @param price - The price to format
 * @param options - Additional formatting options
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0
  }).format(price);
};
