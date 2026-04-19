import { Tier } from '../types/index.js'

const LIMITS: Record<Tier, number> = {
  1: Number(process.env.BUDGET_TIER1 ?? 4000),
  2: Number(process.env.BUDGET_TIER2 ?? 8000),
  3: Number(process.env.BUDGET_TIER3 ?? 2000),
}

// Rough estimate: 1 token ≈ 4 characters
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function tierLimit(tier: Tier): number {
  return LIMITS[tier]
}

export function isWithinBudget(text: string, tier: Tier): boolean {
  return estimateTokens(text) <= LIMITS[tier]
}

export function budgetRemaining(usedTokens: number, tier: Tier): number {
  return Math.max(0, LIMITS[tier] - usedTokens)
}
