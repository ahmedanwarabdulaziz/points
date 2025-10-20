/**
 * Standardized Points System
 * 
 * This file contains utilities for calculating points based on the standardized
 * rate of 10 points per $1 spent across all businesses and customer classes.
 */

// Standardized points rate - cannot be changed
export const STANDARD_POINTS_PER_DOLLAR = 10;

/**
 * Calculate points earned from a purchase amount
 * @param amount - The dollar amount spent
 * @returns The number of points earned (always 10 points per $1)
 */
export function calculatePointsFromPurchase(amount: number): number {
  if (amount <= 0) return 0;
  return Math.floor(amount * STANDARD_POINTS_PER_DOLLAR);
}

/**
 * Calculate points earned from a purchase with class-specific bonuses
 * @param amount - The dollar amount spent
 * @param classFeatures - The customer class features (for bonus calculations)
 * @returns The total points earned including bonuses
 */
export function calculatePointsWithBonuses(
  amount: number, 
  classFeatures?: { 
    referralBonus?: number; 
    specialRewards?: string[];
    maxPointsPerTransaction?: number;
  }
): number {
  const basePoints = calculatePointsFromPurchase(amount);
  
  // Apply referral bonus if applicable
  const referralBonus = classFeatures?.referralBonus || 0;
  
  // Apply any special rewards bonuses (this would need to be implemented based on business logic)
  // For now, we'll just add the referral bonus
  
  let totalPoints = basePoints + referralBonus;
  
  // Apply maximum points per transaction limit if set
  const maxPoints = classFeatures?.maxPointsPerTransaction;
  if (maxPoints && totalPoints > maxPoints) {
    totalPoints = maxPoints;
  }
  
  return totalPoints;
}

/**
 * Get the standardized points rate for display purposes
 * @returns The points per dollar rate as a string
 */
export function getPointsRateDisplay(): string {
  return `${STANDARD_POINTS_PER_DOLLAR} points per $1`;
}

/**
 * Validate that a points calculation is using the standard rate
 * @param points - The points to validate
 * @param amount - The dollar amount
 * @returns True if the points match the standard calculation
 */
export function validatePointsCalculation(points: number, amount: number): boolean {
  return points === calculatePointsFromPurchase(amount);
}
