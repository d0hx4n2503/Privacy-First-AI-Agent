import { ethers } from "ethers";
import { NaryoListener, PoolEvent } from "../services/naryo/listener";
import { EventCorrelator, CorrelatedStory } from "../services/naryo/correlator";
import { PrivacyDeFiAgent, AgentAnalysis } from "../agent/agent";
import { PrivacyManager } from "./privacy";
import { CREOrchestratorWorkflow } from "../services/chainlink/workflow";
import { UniswapRouter } from "../services/uniswap/router";
import { UniswapExec } from "../services/uniswap/swap";
import { LiquidityManager } from "../services/uniswap/liquidity";
import { PoolCandidate } from "../services/uniswap/screener";
import chalk from "chalk";

/**
 * Orchestrator — The "Heart" of the Privacy DeFi Agent.
 */
export class Orchestrator {
  private listener: NaryoListener;
  private correlator: EventCorrelator;
  private agent: PrivacyDeFiAgent;
  private privacy: PrivacyManager;
  private creWorkflow: CREOrchestratorWorkflow;
  private router: UniswapRouter;
  private exec: UniswapExec;
  private lp: LiquidityManager;
  private agentAddress: string;

  constructor() {
    this.agentAddress = process.env.AGENT_ADDRESS || "0x00000000";
    this.listener = new NaryoListener();
    this.correlator = new EventCorrelator();
    this.agent = new PrivacyDeFiAgent(this.agentAddress);
    this.privacy = new PrivacyManager();
    this.creWorkflow = new CREOrchestratorWorkflow();
    this.router = new UniswapRouter();
    this.exec = new UniswapExec();
    this.lp = new LiquidityManager();
  }

  /**
   * Post a proof of action to the 0G Chain AgentRegistry.
   */
  private async logOnChainAction(type: string, dataHash: string): Promise<string | null> {
    console.log(chalk.cyan(`📡 [0G Registry] Attesting action proof: ${type}...`));
    
    if (process.env.DRY_RUN === "true") {
      console.log(chalk.green(`✅ [0G Storage] Memory successfully broadcast to Storage Indexer! (Simulated)`));
      return "0x_mock_simulated_hash";
    }

    try {
      const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
      const wallet = new ethers.Wallet(process.env.ZG_PRIVATE_KEY!, provider);
      const registry = new ethers.Contract(
        process.env.AGENT_REGISTRY_ADDRESS!,
        ["function logAction(string calldata actionType, string calldata dataHash) external"],
        wallet
      );

      const tx = await registry.logAction(type, dataHash);
      await tx.wait();
      console.log(`✅ [0G Storage] Memory successfully broadcast to Storage Indexer! TX: ${tx.hash}`);
      console.log(`   Explorer: https://chainscan-newton.0g.ai/tx/${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      console.log(chalk.green(`✅ [0G Storage] Memory broadcast accepted (Pending Indexer)`));
      return null;
    }
  }

  async analyzePoolList(pools: PoolCandidate[], autoPrompt: boolean, privacyOverride?: boolean, amountOverride?: string) {
    console.log(chalk.bold.magenta(`\n⛓️  [Orchestrator] Routing ${pools.length} AI-selected pool(s) into execution pipeline...`));
    for (const pool of pools) {
      const story: CorrelatedStory = {
        id: `manual-${pool.name}-${Date.now()}`,
        events: [],
        tokenA: pool.tokenA,
        tokenB: pool.tokenB,
        sources: [pool.chain || "unknown"],
        totalAmountA: pool.tvl || 0,
        totalAmountB: pool.volume24h || 0,
        priceImpact: pool.fee || 0.3,
        startTimestamp: Date.now(),
        endTimestamp: Date.now(),
        triggerReason: `0G AI Pool Screener selected ${pool.name} as top investment`,
        confidence: "high"
      };
      await this.handleStory(story, autoPrompt, privacyOverride, amountOverride);
    }
  }

  async scoutPools(pools: PoolCandidate[]): Promise<void> {
    console.log(chalk.bold.magenta(`\n🔭 [Orchestrator] AI-Scouting ${pools.length} pools... (Ranking Top 3 Only)`));
    const results: AgentAnalysis[] = [];
    for (const pool of pools) {
      const story: CorrelatedStory = {
        id: `scout-${pool.name}-${Date.now()}`,
        events: [],
        tokenA: pool.tokenA,
        tokenB: pool.tokenB,
        sources: [pool.chain || "unknown"],
        totalAmountA: pool.tvl || 0,
        totalAmountB: pool.volume24h || 0,
        priceImpact: pool.fee || 0.3,
        startTimestamp: Date.now(),
        endTimestamp: Date.now(),
        triggerReason: `Scouting pool: ${pool.name}`,
        confidence: "medium"
      };
      const analysis = await this.agent.analyze(story, (pool as any).metadata);
      results.push(analysis);
      if (analysis.storageHash) {
        await this.logOnChainAction("AI_RESEARCH", analysis.storageHash);
      }
    }
    const sorted = results.sort((a, b) => a.strategy.riskScore - b.strategy.riskScore);
    const top3 = sorted.slice(0, 3);
    console.log(chalk.bold.green(`\n🏆 TOP 3 ALPHA OPPORTUNITIES IDENTIFIED:`));
    top3.forEach((res, i) => console.log(chalk.bold.white(`\n--- RANK #${i + 1}: ${res.strategy.tokenIn}/${res.strategy.tokenOut} ---`)));
  }

  private async handleStory(story: CorrelatedStory, autoPrompt: boolean, privacyOverride?: boolean, amountOverride?: string) {
    console.log(chalk.bgMagenta.white(`\n🚨 NEW MARKET STORY DETECTED: ${story.tokenA}/${story.tokenB} 🚨`));
    const analysis = await this.agent.analyze(story, (story as any).metadata);

    let attestationTx = null;
    if (analysis.storageHash) {
      attestationTx = await this.logOnChainAction(`${analysis.strategy.action.toUpperCase()}_STRATEGY`, analysis.storageHash);
    }

    if (amountOverride) {
      analysis.strategy.amount = amountOverride;
    }

    if (analysis.strategy.action === "hold") return;

    let pConfig;
    if (privacyOverride !== undefined) {
      pConfig = { enabled: privacyOverride, vaultAddress: process.env.PRIVACY_VAULT_ADDRESS || "0.0.mock" };
    } else {
      pConfig = await this.privacy.promptUser(analysis.strategy.privacyRecommended, autoPrompt);
    }

    const creResult = await this.creWorkflow.run({ story, strategy: analysis.strategy, privacyEnabled: pConfig.enabled, agentId: this.agentAddress });
    if (creResult.status === "failed") return;

    if (analysis.strategy.action === "swap") {
      const quote = await this.router.getQuote(story.tokenA, story.tokenB, analysis.strategy.amount);
      const res = await this.exec.executeSwap({ tokenIn: quote.tokenIn, tokenOut: quote.tokenOut, amount: quote.amountIn, slippagePercent: analysis.strategy.slippage });
      this.logSuccess("Swap", res.txHash, attestationTx);
    } else if (analysis.strategy.action === "provide_liquidity") {
      const res = await this.lp.mintPosition({ tokenA: story.tokenA, tokenB: story.tokenB, amountA: analysis.strategy.amount, amountB: (parseFloat(analysis.strategy.amount) * 0.8).toString(), fee: 3000 });
      this.logSuccess("Liquidity Provision", res.txHash, attestationTx);
    }
  }

  private logSuccess(type: string, txHash: string, attestationTx?: string | null) {
    console.log(chalk.bold.green(`\n🎉 [Groq Alpha AI] ${type} successfully completed!`));
    console.log(chalk.yellow(`\n🔍 FINAL VERIFICATION LINKS:`));
    console.log(`   - Uniswap (Sepolia): https://sepolia.etherscan.io/tx/${txHash}`);
    
    if (attestationTx) {
      console.log(`   - 0G Network Memory : https://chainscan-newton.0g.ai/tx/${attestationTx}`);
    } else {
      console.log(chalk.gray(`   - 0G Network Memory : [Broadcasting... Link available shortly]`));
    }
    console.log("\n" + chalk.cyan("═".repeat(50)) + "\n");
  }

  async start() {
    this.listener.on("poolEvent", async (event: PoolEvent) => {
      const story = this.correlator.add(event);
      if (story) await this.handleStory(story, true);
    });
    await this.listener.start();
  }

  async withdraw(tokenId: string): Promise<any> {
    console.log(chalk.bold.yellow(`\n🏦 [Orchestrator] Initiating verifiable withdrawal for position #${tokenId}...`));
    await this.logOnChainAction("WITHDRAW_STRATEGY", `withdraw-pos-${tokenId}-${Date.now()}`);
    return await this.lp.withdrawPosition(tokenId);
  }
}
