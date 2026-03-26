import "dotenv/config";
import { CorrelatedStory } from "../naryo/correlator";
import { ZGInferenceClient, StrategyRecommendation } from "./inference";
import { ZGRAGMemory } from "./rag";

export interface AgentAnalysis {
  strategy: StrategyRecommendation;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  timestamp: number;
}

/**
 * OpenClaw-compatible AI Agent implementing the Agent Commerce Protocol (ACP).
 * Uses 0G Compute for private inference and 0G Storage for RAG memory.
 */
export class PrivacyDeFiAgent {
  private agentId: string;
  private inference: ZGInferenceClient;
  private memory: ZGRAGMemory;
  private readonly dryRun: boolean;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.inference = new ZGInferenceClient();
    this.memory = new ZGRAGMemory();
    this.dryRun = process.env.DRY_RUN === "true";
  }

  /**
   * Analyze a correlated market story and produce a strategy recommendation.
   * This is the main ACP `analyze` entry point.
   */
  async analyze(story: CorrelatedStory): Promise<AgentAnalysis> {
    console.log(`\n🤖 [OpenClaw] Agent ${this.agentId} analyzing story...`);
    console.log(
      `   Pair: ${story.tokenA}/${story.tokenB} | Sources: ${story.sources.join(", ")}`
    );
    console.log(`   Reason: ${story.triggerReason}`);

    // 1. Retrieve relevant past decisions from RAG memory
    const context = await this.memory.retrieve(
      `${story.tokenA} ${story.tokenB} DeFi strategy`
    );

    // 2. Call 0G Sealed Inference
    const strategy = await this.inference.reason({
      story,
      historicalContext: context,
      agentId: this.agentId,
    });

    // 3. Save this analysis to persistent memory
    await this.memory.save({
      timestamp: Date.now(),
      story,
      strategy,
      agentId: this.agentId,
    });

    const analysis: AgentAnalysis = {
      strategy,
      confidence: story.confidence,
      reasoning: strategy.reasoning,
      timestamp: Date.now(),
    };

    this.logAnalysis(analysis);
    return analysis;
  }

  /**
   * Agent identity for ACP / HCS-14 registration.
   */
  identity() {
    return {
      agentId: this.agentId,
      framework: "OpenClaw",
      version: "1.0.0",
      capabilities: [
        "defi-strategy",
        "private-inference",
        "autonomous-trading",
      ],
    };
  }

  private logAnalysis(analysis: AgentAnalysis): void {
    const { strategy } = analysis;
    console.log(`\n📊 [OpenClaw] Strategy Recommendation:`);
    console.log(`   Action   : ${strategy.action}`);
    console.log(`   TokenIn  : ${strategy.tokenIn}`);
    console.log(`   TokenOut : ${strategy.tokenOut}`);
    console.log(`   Amount   : ${strategy.amount}`);
    console.log(`   Risk     : ${strategy.riskScore}/10`);
    console.log(`   Reasoning: ${strategy.reasoning}`);
  }
}
