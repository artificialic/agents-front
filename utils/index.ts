/**
 * Applies a multiplier to a cost value with validation
 *
 * @param {number | undefined} cost - The original cost value to be multiplied
 * @param {number} multiplier - The multiplier to apply to the cost
 * @returns {number} The calculated cost after applying the multiplier. Returns 0 if cost is invalid.
 *
 * @example
 * applyCostMultiplier(10, 1.5) // returns 15
 * applyCostMultiplier(undefined, 1.5) // returns 0
 * applyCostMultiplier(10, NaN) // returns 10 (uses default multiplier of 1)
 */
export function applyCostMultiplier(cost: number | undefined, multiplier: number): number {
  const validCost: number = Number.isFinite(cost) ? cost! : 0;
  const validMultiplier: number = Number.isFinite(multiplier) ? multiplier : 1;
  return validCost * validMultiplier;
}
