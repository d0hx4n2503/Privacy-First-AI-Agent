import "dotenv/config";
import { CorrelatedStory } from "../services/naryo/correlator";
import { ZGInferenceClient, StrategyRecommendation } from "../services/zero-g/inference";
import { ZGRAGMemory } from "../services/zero-g/storage";
import chalk from "chalk";

export interface AgentAnalysis {
  strategy: StrategyRecommendation;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  storageHash?: string;
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
  async analyze(story: CorrelatedStory, metadata?: any): Promise<AgentAnalysis> {
    console.log(`\n🧠 [Groq Alpha AI] Analyzing market narrative...`);
    console.log(
      `   Pair: ${chalk.bold(story.tokenA)}/${chalk.bold(story.tokenB)} | Network: ${story.sources.join(", ")}`
    );

    // 1. Retrieve relevant past decisions from RAG memory
    const context = await this.memory.retrieve(
      `${story.tokenA} ${story.tokenB} DeFi strategy`
    );

    // 2. Call AI Inference
    const strategy = await this.inference.reason({
      story,
      historicalContext: context,
      agentId: this.agentId,
      metadata,
    });

    // 3. Save this analysis to persistent memory (Quiet mode)
    const storageHash = await this.memory.save({
      timestamp: Date.now(),
      story,
      strategy,
      agentId: this.agentId,
    });

    const analysis: AgentAnalysis = {
      strategy,
      confidence: story.confidence,
      reasoning: strategy.reasoning,
      storageHash,
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
      framework: "GroqAlpha",
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
    console.log(chalk.bold.cyan(`\n📊 [Groq Alpha AI] Strategic Analysis Result:`));
    console.log(`   Action   : ${chalk.bold.yellow(strategy.action.toUpperCase())}`);
    console.log(`   Risk     : ${strategy.riskScore}/10`);
    console.log(`   Summary  : ${strategy.reasoning}`);
    
    if (strategy.analysis_breakdown) {
      console.log(chalk.gray(`\n   --- Deep Analysis Breakdown ---`));
      console.log(`   🌐 Market Sentiment : ${strategy.analysis_breakdown.market_sentiment}`);
      console.log(`   🧬 Technical Health : ${strategy.analysis_breakdown.technical_health}`);
      console.log(`   💰 Yield Analysis    : ${strategy.analysis_breakdown.yield_analysis}`);
      console.log(`   🛡️  Risk Mitigation  : ${strategy.analysis_breakdown.risk_mitigation}`);
    }
  }
}
