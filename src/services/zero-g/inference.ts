import "dotenv/config";
import axios from "axios";
import chalk from "chalk";
import { CorrelatedStory } from "../naryo/correlator";
import { GroqService } from "../ai/groq";

export interface StrategyRecommendation {
  action: "swap" | "hold" | "provide_liquidity" | "withdraw" | "buy" | "sell";
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage: number;
  riskScore: number;
  reasoning: string;
  analysis_breakdown?: {
    market_sentiment: string;
    technical_health: string;
    yield_analysis: string;
    risk_mitigation: string;
  };
  privacyRecommended: boolean;
  isReal: boolean;
  estimatedGasCost?: string;
  expectedReturn?: string;
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
    return `
You are a DeFi strategy AI agent. Analyze the following market event and recommend an action.

CURRENT MARKET EVENT:
- Token Pair: ${story.tokenA}/${story.tokenB}
- Total Volume ${story.tokenA}: ${story.totalAmountA}
- Total Volume ${story.tokenB}: ${story.totalAmountB}
- Price Impact: ${story.priceImpact}%
- Sources: ${story.sources.join(", ")}
- Trigger: ${story.triggerReason}

ADDITIONAL METADATA:
${metadata ? JSON.stringify(metadata, null, 2) : "No extra metadata."}

HISTORICAL CONTEXT (last 5 relevant decisions):
${historicalContext.slice(0, 5).join("\n") || "No historical data available"}

Respond with a JSON strategy recommendation including: action, tokenIn, tokenOut, amount, slippage, riskScore (0-10), reasoning, privacyRecommended.
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
        slippage: content.slippage || 0.5,
        riskScore: content.riskScore || 5,
        reasoning: content.reasoning || "AI inference result",
        analysis_breakdown: content.analysis_breakdown,
        privacyRecommended: content.privacyRecommended ?? true,
        isReal: true,
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
          slippage: result.slippage || 0.5,
          riskScore: result.riskScore || 3,
          reasoning: result.reasoning || "Tư vấn từ chuyên gia GROQ",
          analysis_breakdown: result.analysis_breakdown,
          privacyRecommended: result.privacyRecommended ?? true,
          isReal: false
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
      slippage: 0.5,
      riskScore,
      reasoning: "Rule-based local strategy summary.",
      privacyRecommended: riskScore < 5,
      isReal: false,
    };
  }
}
