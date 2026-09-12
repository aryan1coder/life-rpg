/**
 * LIFE RPG Authoritative Economy Engine.
 * Enforces non-negative balances and records transaction boundaries.
 */

export function earnGold(
  currentBalance: number,
  amount: number
): { newBalance: number; delta: number } {
  const safeDelta = Math.max(0, Math.floor(amount));
  const newBalance = Math.max(0, currentBalance) + safeDelta;
  return { newBalance, delta: safeDelta };
}

export function spendGold(
  currentBalance: number,
  amount: number
): {
  success: boolean;
  newBalance: number;
  shortfall: number;
} {
  const safeCost = Math.max(0, Math.floor(amount));
  if (currentBalance < safeCost) {
    return {
      success: false,
      newBalance: currentBalance,
      shortfall: safeCost - currentBalance,
    };
  }

  const newBalance = currentBalance - safeCost;
  return {
    success: true,
    newBalance,
    shortfall: 0,
  };
}

export function validateAffordability(
  currentBalance: number,
  cost: number
): {
  affordable: boolean;
  shortfall: number;
} {
  const safeCost = Math.max(0, Math.floor(cost));
  const shortfall = Math.max(0, safeCost - currentBalance);
  return {
    affordable: currentBalance >= safeCost,
    shortfall,
  };
}
