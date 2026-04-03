import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { ZGPoolRankingClient, AIRankingResult } from "./pool-inference";

export interface PoolCandidate {
  name: string;
  tokenA: string;
  tokenB: string;
  poolAddress?: string;
  chain?: string;
  tvl?: number;        // Total Value Locked in USD
  volume24h?: number;  // 24h trading volume in USD
  fee?: number;        // Fee tier in % (e.g. 0.05, 0.3, 1.0)
  notes?: string;
}

export interface ScreeningResult {
  aiResult: AIRankingResult;   // Full AI ranking from 0G Compute (or fallback)
  timestamp: number;
  totalAnalyzed: number;
  topPool: PoolCandidate;      // Resolved pool object for the #1 pick
  inputPools: PoolCandidate[]; // Original list for reference
}

/**
 * PoolScreener — Proactive pool analysis pipeline.
 *
 * PRIMARY PATH  : All pools → 0G Compute (one comparative prompt) → AI ranking
 * FALLBACK PATH : 0G offline → Local rule-based ranking (clearly flagged)
 *
 * The screener does NOT score pools itself. It delegates entirely to
 * ZGPoolRankingClient so the AI makes the comparative judgement.
 */
export class PoolScreener {
  private ranker: ZGPoolRankingClient;

  constructor() {
    this.ranker = new ZGPoolRankingClient();
  }

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Load pools from a JSON file and run AI screening.
   */
  async screenFromFile(filePath: string): Promise<ScreeningResult> {
    const abs = path.resolve(filePath);
    console.log(`\n📂 [Pool Screener] Loading pool list from: ${abs}`);

    let raw: string;
    try {
      raw = await fs.readFile(abs, "utf-8");
    } catch {
      throw new Error(
        `Cannot read pools file: ${abs}\n` +
        `Create one modelled after examples/pools.json`
      );
    }

    const pools: PoolCandidate[] = JSON.parse(raw);
    if (!Array.isArray(pools) || pools.length === 0) {
      throw new Error("pools.json must be a non-empty JSON array.");
    }

    return this.screen(pools);
  }

  /**
   * Screen an array of pool candidates.
   * Sends them ALL to 0G AI in one shot for comparative ranking.
   */
  async screen(pools: PoolCandidate[]): Promise<ScreeningResult> {
    console.log(`\n🔍 [Pool Screener] Preparing ${pools.length} pool(s) for 0G AI comparative analysis...`);
    this.printPoolSummary(pools);

    // ── Primary: 0G Sealed AI Inference ───────────────────────────
    const aiResult = await this.ranker.rankPools(pools);

    // Resolve the top-ranked pool back to the original PoolCandidate object
    const bestPoolName = aiResult.bestPool.poolName;
    const topPool =
      pools.find((p) => p.name === bestPoolName) ?? pools[0];

    return {
      aiResult,
      timestamp: Date.now(),
      totalAnalyzed: pools.length,
      topPool,
      inputPools: pools,
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────

  private printPoolSummary(pools: PoolCandidate[]): void {
    console.log("─".repeat(55));
    for (const p of pools) {
      const volRatio = p.tvl ? ((p.volume24h ?? 0) / p.tvl * 100).toFixed(1) + "%" : "N/A";
      console.log(
        `  • ${p.name.padEnd(12)} | TVL: $${this.fmt(p.tvl)}` +
        ` | Vol/TVL: ${volRatio} | Fee: ${p.fee ?? "?"}% | Chain: ${p.chain ?? "?"}`
      );
    }
    console.log("─".repeat(55));
  }

  private fmt(n?: number): string {
    if (!n) return "N/A";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }
}
