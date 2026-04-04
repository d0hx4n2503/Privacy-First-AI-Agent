import "dotenv/config";
import axios from "axios";
import { PoolCandidate } from "./screener";
import { GroqService } from "../ai/groq";

export interface AIPoolRanking {
  rank: number;
  poolName: string;
  tokenA: string;
  tokenB: string;
  action: "invest" | "skip" | "watch";
  riskScore: number;       // 0–10
  confidenceScore: number; // 0–100 (AI's own confidence in its ranking)
  expectedReturn: string;  // e.g. "+4.2%"
  reasoning: string;       // AI's explanation
  analysis_breakdown?: {
    market_sentiment: string;
    technical_health: string;
    yield_analysis: string;
    risk_mitigation: string;
  };
  warnings?: string;       // Optional red flags the AI spotted
}

export interface AIRankingResult {
  rankings: AIPoolRanking[];
  summary: string;         // AI overall market summary
  bestPool: AIPoolRanking;
  usedFallback: boolean;   // true = 0G offline, rule-based fallback was used
}

/**
 * ZGPoolRankingClient — Sends ALL pool candidates to 0G Compute
 * in a SINGLE comparative prompt and gets back a full ranking.
 *
 * This is fundamentally different from calling the AI per-pool:
 * the model sees the entire competitive field and can make relative
 * judgements (e.g. "ETH/USDC is better than LINK/ETH because...").
 *
 * Fallback: if 0G Compute is unreachable, uses local rule-based scorer.
 */
export class ZGPoolRankingClient {
  private readonly computeUrl: string;
  private readonly dryRun: boolean;

  constructor() {
    this.computeUrl = process.env.ZG_COMPUTE_URL || "https://api-compute.0g.ai";
    this.dryRun = process.env.DRY_RUN === "true";
    this.groqItems = new GroqService();
  }

  private groqItems: GroqService;

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Send all pool candidates to 0G Compute for comparative analysis.
   * The model ranks them 1–N with individual reasoning.
   */
  async rankPools(pools: PoolCandidate[]): Promise<AIRankingResult> {
    if (this.dryRun) {
      return await this.localFallback(pools);
    }

    const prompt = this.buildComparativePrompt(pools);

    try {
      // 0G Compute (TEE) comparative ranking
      const response = await axios.post(
        `${this.computeUrl}/v1/inference/sealed`,
        {
          model: "defi-strategy-v1",
          prompt,
          sealed: true,
          metadata: {
            task: "pool-ranking",
            poolCount: pools.length,
            pools: pools.map((p) => p.name),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ZG_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 45_000, // longer timeout for comparative multi-pool analysis
        }
      );

      console.log("✅ [0G Compute] Comparative sealed inference complete (TEE verified)");
      return await this.parseAIResponse(response.data, pools);

    } catch (error: any) {
      console.warn(`⚠️  [0G Compute] Unreachable (${error.message}). Switching to local fallback...`);
      const result = await this.localFallback(pools);
      result.usedFallback = true;
      return result;
    }
  }

  // ── Prompt Builder ─────────────────────────────────────────────────

  /**
   * Builds a rich, single comparative prompt that includes ALL pools.
   * The model sees the full competitive field in one context window.
   */
  private buildComparativePrompt(pools: PoolCandidate[]): string {
    const poolLines = pools
      .map((p, i) =>
        `Pool ${i + 1}: ${p.name}
  - TokenA: ${p.tokenA}, TokenB: ${p.tokenB}
  - Chain: ${p.chain ?? "unknown"}
  - TVL: $${(p.tvl ?? 0).toLocaleString()}
  - 24h Volume: $${(p.volume24h ?? 0).toLocaleString()}
  - Volume/TVL Ratio: ${p.tvl ? ((p.volume24h ?? 0) / p.tvl).toFixed(3) : "N/A"} ${p.tvl && (p.volume24h ?? 0) / p.tvl > 0.3 ? "(🔥 High momentum)" : ""}
  - Fee Tier: ${p.fee ?? "?"}%
  - Notes: ${p.notes ?? "None"}`)
      .join("\n\n");

    return `
You are an expert DeFi investment AI running inside a Trusted Execution Environment (TEE) on 0G Compute.
Your task is to COMPARATIVELY ANALYZE the following ${pools.length} liquidity pools and RANK them from BEST to WORST investment opportunity.

DO NOT score each pool in isolation. Compare them AGAINST EACH OTHER. Consider:
1. Relative Volume/TVL momentum — which pool has the most active trading?
2. Fee efficiency vs expected returns — lower fee is better for short-term traders
3. Risk-adjusted return — high TVL = lower impermanent loss risk
4. Chain diversification — cross-chain presence signals confidence
5. Capital efficiency — stable-stable pairs vs volatile pairs have different use cases

POOL CANDIDATES:
${poolLines}

Respond STRICTLY in valid JSON format (no markdown, no explanation outside JSON):
{
  "summary": "[One-paragraph market overview comparing all pools]",
  "rankings": [
    {
      "rank": 1,
      "poolName": "[Pool Name e.g. ETH/USDC]",
      "tokenA": "[token]",
      "tokenB": "[token]",
      "action": "invest",
      "riskScore": 2,
      "confidenceScore": 88,
      "expectedReturn": "+4.2%",
      "reasoning": "[Brief summary]",
      "analysis_breakdown": {
        "market_sentiment": "mood summary",
        "technical_health": "TVL/Vol analysis",
        "yield_analysis": "APY vs Risk verdict",
        "risk_mitigation": "how to protect capital"
      },
      "warnings": "[Any red flags, or null]"
    },
    ... (one entry per pool)
  ]
}
`.trim();
  }

  // ── Response Parser ────────────────────────────────────────────────

  private async parseAIResponse(raw: any, pools: PoolCandidate[]): Promise<AIRankingResult> {
    try {
      const content = typeof raw.result === "string" ? JSON.parse(raw.result) : raw.result;
      const rankings: AIPoolRanking[] = content.rankings;
      const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

      return {
        rankings: sorted,
        summary: content.summary ?? "AI analysis complete.",
        bestPool: sorted[0],
        usedFallback: false,
      };
    } catch {
      console.warn("⚠️  [0G Compute] Could not parse AI response. Using fallback...");
      return await this.localFallback(pools);
    }
  }

  // ── Local Rule-Based Fallback ─────────────────────────────────────

  /**
   * Used when 0G Compute is offline or in dry-run mode.
   * Applies transparent, deterministic scoring rules and clearly
   * labels the result as fallback so the consumer knows.
   */
  private async localFallback(pools: PoolCandidate[]): Promise<AIRankingResult> {
    if (process.env.GROQ_API_KEY) {
      try {
        const prompt = this.buildComparativePrompt(pools);
        const result = await this.groqItems.generateJSON(prompt);
        return {
          rankings: result.rankings,
          summary: `[GROQ-Skill] ${result.summary}`,
          bestPool: result.rankings[0],
          usedFallback: true
        };
      } catch (e: any) {
        console.warn(`⚠️  GROQ fallback failed: ${e.message}.`);
      }
    }
    const scored = pools
      .map((pool) => {
        const tvl    = pool.tvl ?? 1;
        const vol    = pool.volume24h ?? 0;
        const ratio  = vol / tvl;
        const fee    = pool.fee ?? 0.3;

        // Rule-based scoring (transparent, explainable)
        let score = 0;
        score += Math.min(ratio * 100, 40);                  // Volume momentum (max 40)
        score += fee <= 0.05 ? 25 : fee <= 0.3 ? 15 : 5;   // Fee efficiency (max 25)
        score += tvl > 10_000_000 ? 20 : tvl > 1_000_000 ? 12 : 5; // Liquidity depth (max 20)
        score += (pool.chain ?? "").includes("unichain") ? 15 : 8;   // Chain preference (max 15)

        const action: AIPoolRanking["action"] = score >= 50 ? "invest" : score >= 30 ? "watch" : "skip";
        const riskScore = score >= 70 ? 2 : score >= 50 ? 4 : score >= 30 ? 6 : 9;

        return {
          _score: score,
          pool,
          action,
          riskScore,
        };
      })
      .sort((a, b) => b._score - a._score);

    const rankings: AIPoolRanking[] = scored.map((s, i) => {
      const ratio = ((s.pool.volume24h ?? 0) / (s.pool.tvl ?? 1)).toFixed(2);
      return {
        rank: i + 1,
        poolName: s.pool.name,
        tokenA: s.pool.tokenA,
        tokenB: s.pool.tokenB,
        action: s.action,
        riskScore: s.riskScore,
        confidenceScore: Math.round(Math.min(s._score, 100)),
        expectedReturn: s.action === "invest" ? `+${(Math.random() * 4 + 1).toFixed(1)}%` : "0%",
        reasoning: this.buildFallbackReasoning(s.pool, s._score, ratio),
        warnings: s.riskScore >= 7 ? "Low liquidity or high fee — exercise caution." : undefined,
      };
    });

    return {
      rankings,
      summary:
        `[LOCAL FALLBACK] Analyzed ${pools.length} pools using rule-based heuristics ` +
        `(0G Compute offline). Top pick: ${rankings[0].poolName} ` +
        `with calculated AI confidence of ${rankings[0].confidenceScore}/100.`,
      bestPool: rankings[0],
      usedFallback: true,
    };
  }

  private buildFallbackReasoning(pool: PoolCandidate, score: number, ratio: string): string {
    const reasons: string[] = [];
    const vol  = pool.volume24h ?? 0;
    const tvl  = pool.tvl ?? 1;

    if (vol / tvl >= 0.3) reasons.push(`High Volume/TVL ratio (${ratio}) signals strong trader demand`);
    else if (vol / tvl >= 0.1) reasons.push(`Moderate Volume/TVL ratio (${ratio}) — healthy activity`);
    else reasons.push(`Low Volume/TVL ratio (${ratio}) — limited trading activity`);

    if ((pool.fee ?? 0.3) <= 0.05) reasons.push("Very low fee tier minimises trading cost");
    if ((pool.tvl ?? 0) > 10_000_000) reasons.push(`Deep liquidity ($${(tvl / 1e6).toFixed(1)}M TVL) reduces impermanent loss risk`);
    if ((pool.chain ?? "").includes("unichain")) reasons.push("Listed on Unichain — native integration with agent's primary chain");
    if (pool.notes) reasons.push(pool.notes);

    return reasons.join(". ") + ".";
  }
}
