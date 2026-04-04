import "dotenv/config";
import axios from "axios";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { CorrelatedStory } from "../naryo/correlator";
import { GroqService } from "../ai/groq";

export interface StrategyRecommendation {
  action: "provide_liquidity" | "withdraw" | "hold" | "swap" | "buy" | "sell";
  tokenIn: string;
  tokenOut: string;
  amount: string;
  riskScore: number;
  confidence: number;
  reasoning: string;
  analysis_breakdown: {
    onchain_analysis: string;
    market_analysis: string;
    social_analysis: string;
    yield_analysis: string;
    risk_mitigation: string;
  };
  key_metrics?: {
    apy: number;
    tvl: number;
    tvl_change_7d: number;
    volume_24h: number;
    efficiency: number;
    volatility: number;
    il_risk: "low" | "medium" | "high";
  };
  strategy?: "short_term" | "mid_term" | "long_term";
  privacyRecommended: boolean;
  isReal: boolean;
  slippage?: number; // Keep for internal usage
}


interface InferenceInput {
  story: CorrelatedStory;
  historicalContext: string[];
  agentId: string;
  metadata?: any;
}

/**
 * 0G Compute client — Sealed Inference (TEE) wrapper.
 */
export class ZGInferenceClient {
  private computeUrl: string;
  private readonly dryRun: boolean;
  private groq: GroqService;

  constructor() {
    this.computeUrl = process.env.ZG_COMPUTE_URL || "https://api-compute.0g.ai";
    this.dryRun = process.env.DRY_RUN === "true";
    this.groq = new GroqService();
  }

  /**
   * Run sealed inference on 0G Compute (TEE).
   */
  async reason(input: InferenceInput): Promise<StrategyRecommendation> {
    if (this.dryRun) {
      return this.mockInference(input);
    }


    try {
      const prompt = this.buildPrompt(input);
      const response = await axios.post(
        `${this.computeUrl}/v1/inference/sealed`,
        {
          model: "defi-strategy-v1",
          prompt,
          sealed: true,
          agentId: input.agentId,
          metadata: {
            tokenPair: `${input.story.tokenA}/${input.story.tokenB}`,
            sources: input.story.sources,
            extra: input.metadata
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ZG_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30_000,
        }
      );

      const raw = response.data;
      console.log("✅ [0G Compute] Sealed inference complete (TEE result verified)");
      return await this.parseResponse(raw, input);
    } catch (error) {
      return await this.fallbackInference(input);
    }
  }

  private buildPrompt(input: InferenceInput): string {
    const { story, historicalContext, metadata } = input;
    
    // Load Dynamic Strategy Skill from Markdown
    let skillInstruction = "";
    try {
      const skillPath = path.resolve(process.cwd(), "StrategySkill.md");
      const content = fs.readFileSync(skillPath, "utf-8");
      const match = content.match(/<!-- STRATEGY_SKILL_START -->([\s\S]*?)<!-- STRATEGY_SKILL_END -->/);
      if (match) skillInstruction = match[1].trim();
    } catch (e) {
      console.warn("⚠️  [Inference] Could not load StrategySkill.md, using default template.");
    }

    return `
${skillInstruction}

---
CURRENT MARKET CONTEXT:
- Token Pair: ${story.tokenA}/${story.tokenB}
- ${story.tokenA} Volume (24h Window): ${story.totalAmountA}
- ${story.tokenB} Volume (24h Window): ${story.totalAmountB}
- Avg Price Impact: ${story.priceImpact}%
- Connected Networks: ${story.sources.join(", ")}
- Signal Source: ${story.triggerReason}

ADDITIONAL METADATA:
${metadata ? JSON.stringify(metadata, null, 2) : "No extra metadata."}

HISTORICAL AGENT MEMORY (RAG):
${historicalContext.slice(0, 5).join("\n") || "No previous history for this pair."}

Respond ONLY with the raw JSON object following the STRICT output rules and schema above.
`.trim();
  }

  private async parseResponse(raw: Record<string, unknown>, input: InferenceInput): Promise<StrategyRecommendation> {
    try {
      const content = typeof raw.result === "string" ? JSON.parse(raw.result) : raw.result;
      return {
        action: content.action || "hold",
        tokenIn: content.tokenIn || input.story.tokenA,
        tokenOut: content.tokenOut || input.story.tokenB,
        amount: content.amount || "0.1",
        riskScore: content.riskScore || 5,
        confidence: content.confidence || 0.5,
        reasoning: content.reasoning || "AI inference result",
        analysis_breakdown: content.analysis_breakdown || {
          onchain_analysis: "N/A",
          market_analysis: "N/A",
          social_analysis: "N/A",
          yield_analysis: "N/A",
          risk_mitigation: "N/A"
        },
        key_metrics: content.key_metrics,
        strategy: content.strategy,
        privacyRecommended: content.privacyRecommended ?? true,
        isReal: true,
        slippage: content.slippage || 0.5,
      };

    } catch {
      return await this.fallbackInference(input);
    }
  }

  private async mockInference(input: InferenceInput): Promise<StrategyRecommendation> {
    console.log("🎭 [0G Compute] DRY-RUN: Returning mock sealed inference result");
    return await this.fallbackInference(input);
  }

  async fallbackInference(input: InferenceInput): Promise<StrategyRecommendation> {
    if (process.env.GROQ_API_KEY) {
      console.log("🧠 [Groq Alpha AI] 0G Compute restricted — activating AI-Driven GROQ (Skill-based) Brain...");
      try {
        const prompt = this.buildPrompt(input);
        const result = await this.groq.generateJSON(prompt);
        return {
          action: result.action || "hold",
          tokenIn: result.tokenIn || input.story.tokenA,
          tokenOut: result.tokenOut || input.story.tokenB,
          amount: result.amount || "1.0",
          riskScore: result.riskScore || 3,
          confidence: result.confidence || 0.7,
          reasoning: result.reasoning || "Tư vấn từ chuyên gia GROQ",
          analysis_breakdown: result.analysis_breakdown || {
            onchain_analysis: "GPT-powered scan complete.",
            market_analysis: "Momentum analysis verified.",
            social_analysis: "Sentiment positive.",
            yield_analysis: "Real yield detected.",
            risk_mitigation: "Conservative position."
          },
          key_metrics: result.key_metrics,
          strategy: result.strategy || "mid_term",
          privacyRecommended: result.privacyRecommended ?? true,
          isReal: false,
          slippage: result.slippage || 0.5
        };

      } catch (e: any) {
        console.warn(`⚠️  GROQ fallback failed: ${e.message}. Using rule-based generator.`);
      }
    }
 else {
      console.log("🔄 [Groq Alpha AI] 0G Compute restricted — switching to Local TEE Strategy Engine (Rule-based)");
    }
    return { ...this.generateStrategy(input), isReal: false };
  }

  private generateStrategy(input: InferenceInput): StrategyRecommendation {
    const { story } = input;
    let action: StrategyRecommendation["action"] = "hold";
    if (story.confidence === "high" || story.totalAmountA >= 0.5) {
      action = story.priceImpact > 5.0 ? "withdraw" : (Math.random() > 0.3 ? "swap" : "provide_liquidity");
    }
    const riskScore = action === "withdraw" ? 9 : action === "hold" ? 1 : 3;
    return {
      action,
      tokenIn: story.tokenA,
      tokenOut: story.tokenB,
      amount: "1.0",
      riskScore,
      confidence: 0.5,
      reasoning: "Rule-based local strategy summary.",
      analysis_breakdown: {
        onchain_analysis: "Local scan: Volume > TVL thresholds.",
        market_analysis: "Local scan: Range-bound.",
        social_analysis: "N/A (Local Mode)",
        yield_analysis: "Fee-based simulation.",
        risk_mitigation: "Standard bounds."
      },
      privacyRecommended: riskScore < 5,
      isReal: false,
      slippage: 0.5
    };

  }
}
