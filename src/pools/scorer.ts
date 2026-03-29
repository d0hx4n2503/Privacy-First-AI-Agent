import { PoolCandidate } from "./screener";
import { StrategyRecommendation } from "../agent/inference";
import { RouteQuote } from "../uniswap/router";

export interface PoolScore {
  pool: PoolCandidate;
  totalScore: number;      // 0–100 composite
  breakdown: {
    volumeScore: number;   // 0–25
    feeScore: number;      // 0–20
    aiScore: number;       // 0–35
    priceImpactScore: number; // 0–20
  };
  aiRecommendation: StrategyRecommendation;
  quote: RouteQuote;
  rank?: number;
}

/**
 * Multi-factor pool scoring engine.
 *
 * Weights:
 *   Volume/TVL Ratio  → 25 pts  (momentum indicator)
 *   Fee Efficiency    → 20 pts  (lower fee = better for trader)
 *   AI Strategy Score → 35 pts  (0G sealed inference result)
 *   Price Impact      → 20 pts  (lower impact = deeper liquidity)
 */
export class PoolScorer {
  /**
   * Score a single pool given its AI strategy and current market quote.
   */
  score(
    pool: PoolCandidate,
    aiStrategy: StrategyRecommendation,
    quote: RouteQuote
  ): PoolScore {
    const volumeScore    = this.scoreVolumeTVL(pool);
    const feeScore       = this.scoreFee(pool);
    const aiScore        = this.scoreAI(aiStrategy);
    const priceImpactScore = this.scorePriceImpact(quote);

    const totalScore = Math.round(
      volumeScore + feeScore + aiScore + priceImpactScore
    );

    return {
      pool,
      totalScore,
      breakdown: { volumeScore, feeScore, aiScore, priceImpactScore },
      aiRecommendation: aiStrategy,
      quote,
    };
  }

  /**
   * Rank an array of scored pools (highest score first) and attach rank.
   */
  rank(scores: PoolScore[]): PoolScore[] {
    return scores
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  // ── Factor Scorers ──────────────────────────────────────────────────

  /**
   * Volume/TVL ratio — strong momentum signal.
   *   ≥ 0.5  → 25 pts (exceptional)
   *   ≥ 0.3  → 18 pts (healthy)
   *   ≥ 0.1  → 10 pts (moderate)
   *   < 0.1  →  4 pts (low activity)
   */
  private scoreVolumeTVL(pool: PoolCandidate): number {
    if (!pool.tvl || pool.tvl === 0) return 4;
    const ratio = (pool.volume24h || 0) / pool.tvl;
    if (ratio >= 0.5) return 25;
    if (ratio >= 0.3) return 18;
    if (ratio >= 0.1) return 10;
    return 4;
  }

  /**
   * Fee efficiency — lower fee tier = higher score for traders.
   *   0.01% → 20 pts   (stable-coin optimised)
   *   0.05% → 17 pts   (most common, tight)
   *   0.30% → 10 pts   (standard)
   *   1.00% → 4 pts    (niche / high volatility)
   *   other →  1 pt
   */
  private scoreFee(pool: PoolCandidate): number {
    const fee = pool.fee ?? 0.3;
    if (fee <= 0.01) return 20;
    if (fee <= 0.05) return 17;
    if (fee <= 0.3)  return 10;
    if (fee <= 1.0)  return 4;
    return 1;
  }

  /**
   * AI Strategy score — translate 0G inference result into 0-35 pts.
   *   action=swap  + low risk (≤3)  → 35 pts
   *   action=swap  + mid risk (≤6)  → 22 pts
   *   action=swap  + high risk (>6) → 12 pts
   *   action=hold                   →  0 pts
   */
  private scoreAI(strategy: StrategyRecommendation): number {
    if (strategy.action === "hold") return 0;
    const risk = strategy.riskScore;
    if (risk <= 3)  return 35;
    if (risk <= 6)  return 22;
    return 12;
  }

  /**
   * Price impact score — lower impact = deeper liquidity.
   *   < 0.1% → 20 pts
   *   < 0.5% → 15 pts
   *   < 1.0% → 8 pts
   *   ≥ 1.0% → 2 pts
   */
  private scorePriceImpact(quote: RouteQuote): number {
    const impact = parseFloat(quote.priceImpact ?? "1.0");
    if (impact < 0.1) return 20;
    if (impact < 0.5) return 15;
    if (impact < 1.0) return 8;
    return 2;
  }
}
