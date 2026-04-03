import { ethers } from "ethers";
import { NaryoListener } from "../services/naryo/listener";
import { EventCorrelator } from "../services/naryo/correlator";
import { PrivacyDeFiAgent } from "../agent/agent";
import { PrivacyManager } from "./privacy";
import { CREOrchestratorWorkflow, CREWorkflowInput } from "../services/chainlink/workflow";
import { UniswapRouter } from "../services/uniswap/router";
import { UniswapExec } from "../services/uniswap/swap";
import { LiquidityManager } from "../services/uniswap/liquidity";
import { PoolCandidate } from "../services/uniswap/screener";

import chalk from "chalk";

/**
 * Main Orchestrator tying together all 5 sponsor modules.
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
    this.agentAddress = process.env.AGENT_ADDRESS || "0x00000000";
  }

  /**
   * Post a proof of action to the 0G Chain AgentRegistry.
   */
  private async logOnChainAction(type: string, dataHash: string) {
    if (process.env.DRY_RUN === "true") return;

    try {
      const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
      const wallet = new ethers.Wallet(process.env.ZG_PRIVATE_KEY!, provider);
      const registry = new ethers.Contract(
        process.env.AGENT_REGISTRY_ADDRESS!,
        ["function logAction(string calldata actionType, string calldata dataHash) external"],
        wallet
      );

      console.log(`📡 [0G Registry] Attesting action proof: ${type}...`);
      const tx = await registry.logAction(type, dataHash);
      await tx.wait();
      console.log(`✅ [0G Registry] Proof on-chain: ${tx.hash}`);
      console.log(`   🔗 Explorer: https://chainscan-galileo.0g.ai/tx/${tx.hash}`);
    } catch (error: any) {
      console.warn(`⚠️  [0G Registry] Attestation failed: ${error.message}`);
    }
  }

  async start(autoPrompt: boolean = false) {
    // console.clear();
    console.log(chalk.bold.cyan("\n======================================================="));
    console.log(chalk.bold.cyan("   🛡️  Privacy-first AI Agent for DeFi (Hackathon) 🛡️"));
    console.log(chalk.bold.cyan("=======================================================\n"));

    // 1. Start Naryo Listener
    this.listener.on("poolEvent", async (event) => {
      const story = this.correlator.add(event);
      if (story) {
        await this.handleStory(story, autoPrompt);
      }
    });

    await this.listener.start();

    if (process.env.SIMULATE === "true") {
      // Fire synthetic events to trigger the live pipeline instantly for the demo
      const scenarios = [
        { a: "USDC", b: "ETH", vol: 1.5, reason: "High Volatility Alpha Signal" },
        { a: "ETH", b: "USDC", vol: 0.12, reason: "Inflow from Whale Wallet" },
        { a: "LINK", b: "USDC", vol: 50.0, reason: "Oracle Data Feed Variance" }
      ];
      
      console.log(chalk.gray("   [Naryo] Scanning cross-chain liquidity sinks..."));
      
      await new Promise((resolve) => {
        setTimeout(async () => {
          const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
          const mockStory = {
            tokenA: selected.a,
            tokenB: selected.b,
            totalAmountA: selected.vol,
            totalAmountB: selected.vol * 0.8,
            priceImpact: 0.15,
            eventCount: Math.floor(Math.random() * 5) + 2,
            sources: ["unichain", "ethereum"],
            triggerReason: selected.reason,
            confidence: selected.vol > 1 ? "high" : "medium"
          };
          await this.handleStory(mockStory, autoPrompt).catch(console.error);
          resolve(true);
        }, 2000);
      });
    } else {
      console.log(chalk.yellow("\n📡 [LIVE MODE] Scanning Unichain Sepolia for real Swap events..."));
      console.log(chalk.gray("   (The agent will remain idle until a new pool event is detected on-chain)"));
    }
  }

  /**
   * Manually trigger an event for testing the full live pipeline.
   */
  async triggerManualEvent(tokenA: string = "ETH", tokenB: string = "USDC") {
    console.log(chalk.magenta(`\n🧪 [Test Trigger] Manually injecting ${tokenA}/${tokenB} event into live pipeline...`));
    
    const testStory = {
      tokenA,
      tokenB,
      totalAmountA: 1.5,
      totalAmountB: 4500,
      priceImpact: 0.02,
      eventCount: 3, // Multi-event correlation
      sources: ["unichain", "ethereum"], // Multi-chain discovery
      triggerReason: "High-Alpha Momentum Discovery (0G Verified)",
      confidence: "high"
    };

    await this.handleStory(testStory, true);
  }

  /**
   * Entry-point for the proactive pool-screening path.
   * Takes pool candidates already ranked by 0G AI and routes the
   * top pick (or all picks if desired) into the existing execution pipeline.
   *
   * @param pools  Pool candidates to run through the pipeline (typically just rank #1)
   * @param autoPrompt  Skip the interactive privacy prompt
   * @param privacyOverride  Manually set privacy mode (true = Private, false = Public)
   */
  async analyzePoolList(
    pools: PoolCandidate[], 
    autoPrompt: boolean = false,
    privacyOverride?: boolean,
    amountOverride?: string
  ): Promise<void> {
    console.log(chalk.bold.cyan(`\n⛓️  [Orchestrator] Routing ${pools.length} AI-selected pool(s) into execution pipeline...`));

    for (const pool of pools) {
      // Translate the pool candidate into the CorrelatedStory shape
      // that handleStory() expects (same normalisation as pool-inference.ts)
      const tvl    = pool.tvl ?? 1_000_000;
      const vol24h = pool.volume24h ?? 100_000;
      const ratio  = vol24h / tvl;
      const confidence: "low" | "medium" | "high" =
        ratio >= 0.3 ? "high" : ratio >= 0.1 ? "medium" : "low";

      const story = {
        id:           `pool-${pool.name}-${Date.now()}`,
        tokenA:       pool.tokenA,
        tokenB:       pool.tokenB,
        totalAmountA: vol24h / 1_000_000,
        totalAmountB: (vol24h / 1_000_000) * 0.8,
        priceImpact:  pool.fee ?? 0.3,
        eventCount:   1,
        sources:      [pool.chain ?? "unichain"],
        triggerReason:`0G AI Pool Screener selected ${pool.name} as top investment`,
        confidence,
      };

      await this.handleStory(story, autoPrompt, privacyOverride, amountOverride);
    }
  }

  /**
   * Withdraw liquidity from a position with on-chain attestation.
   */
  async withdraw(tokenId: string): Promise<any> {
    console.log(chalk.bold.yellow(`\n🏦 [Orchestrator] Initiating verifiable withdrawal for position #${tokenId}...`));
    
    // 1. Attest the decision on-chain
    await this.logOnChainAction("WITHDRAW_STRATEGY", `withdraw-pos-${tokenId}-${Date.now()}`);
    
    // 2. Execute the withdrawal
    return await this.lp.withdrawPosition(tokenId);
  }

  /**
   * Main flow executed when a correlated market story is detected.
   */
  private async handleStory(story: any, autoPrompt: boolean, privacyOverride?: boolean, amountOverride?: string) {
    console.log(chalk.bgMagenta.white(`\n🚨 NEW MARKET STORY DETECTED: ${story.tokenA}/${story.tokenB} 🚨`));

    // 1. AI Inference (0G OpenClaw)
    const analysis = await this.agent.analyze(story);

    // 1.5. Post proof to 0G Chain Agent Registry
    if (analysis.storageHash) {
      await this.logOnChainAction(`${analysis.strategy.action.toUpperCase()}_STRATEGY`, analysis.storageHash);
    }

    if (amountOverride) {
      console.log(chalk.yellow(`\n💰 Overriding AI strategy amount: ${analysis.strategy.amount} → ${amountOverride}`));
      analysis.strategy.amount = amountOverride;
    }

    if (analysis.strategy.action === "hold") {
      console.log(chalk.gray("   Agent recommended HOLD. Returning to scanning mode."));
      return;
    }

    // 2. Privacy User Prompt (use override if provided)
    let privacyConfig;
    if (privacyOverride !== undefined) {
      console.log(`\n🔒 [Orchestrator] Using pre-selected privacy mode: ${privacyOverride ? "PRIVATE" : "PUBLIC"}`);
      privacyConfig = {
        enabled: privacyOverride,
        vaultAddress: process.env.PRIVACY_VAULT_ADDRESS || "0.0.mock_vault"
      };
    } else {
      privacyConfig = await this.privacy.promptUser(analysis.strategy.privacyRecommended, autoPrompt);
    }

    // 3. Orchestrate workflow via Chainlink CRE
    const creInput: CREWorkflowInput = {
      story,
      strategy: analysis.strategy,
      privacyEnabled: privacyConfig.enabled,
      agentId: this.agentAddress
    };

    const creResult = await this.creWorkflow.run(creInput);

    if (creResult.status === "failed") {
      console.error(chalk.red("❌ [Orchestrator] Chainlink CRE workflow aborted."));
      return;
    }

    // 4. Execute Swap or LP
    if (analysis.strategy.action === "swap") {
      const quote = await this.router.getQuote(
        analysis.strategy.tokenIn, 
        analysis.strategy.tokenOut, 
        analysis.strategy.amount
      );

      const swapRes = await this.exec.executeSwap({
        tokenIn: quote.tokenIn,
        tokenOut: quote.tokenOut,
        amount: quote.amountIn,
        slippagePercent: analysis.strategy.slippage
      });
      
      this.logSuccess("Swap", swapRes.txHash, analysis);
    } else if (analysis.strategy.action === "provide_liquidity") {
      // For LP, we use both tokens in 50/50 ratio (approx)
      const lpRes = await this.lp.mintPosition({
        tokenA: story.tokenA,
        tokenB: story.tokenB,
        amountA: analysis.strategy.amount,
        amountB: (parseFloat(analysis.strategy.amount) * 0.8).toString(), // Mock ratio for demo
        fee: 3000
      });
      
      this.logSuccess("Liquidity Provision", lpRes.txHash, analysis);
    } else if (analysis.strategy.action === "withdraw") {
      // For withdrawal, we need a tokenId. 
      // In this demo flow, we try to withdraw a default or provided ID.
      const tokenId = (story as any).tokenId || "404"; 
      const lpRes = await this.lp.withdrawPosition(tokenId);
      
      this.logSuccess("Liquidity Withdrawal", lpRes.txHash, analysis);
    }

    if (autoPrompt) {
      setTimeout(() => process.exit(0), 1000);
    }
  }

  private logSuccess(type: string, txHash: string, analysis?: any) {
    console.log(`\n🎉 [Orchestrator] ${type} successfully completed end-to-end!`);
    console.log(chalk.green(`   🏆 Requirements Satisfied:`));
    
    const computeStatus = analysis?.strategy?.isReal ? chalk.cyan("VERIFIED (TEE)") : chalk.yellow("LOCAL FALLBACK");
    const storageStatus = (analysis?.storageHash && !analysis.storageHash.startsWith("local-")) 
      ? chalk.cyan(`FINALIZED (${analysis.storageHash.slice(0, 10)}...)`) 
      : chalk.yellow("OFFLINE/LOCAL");

    console.log(chalk.cyan(`      - [0G Compute] Sealed Inference: ${computeStatus}`));
    console.log(chalk.cyan(`      - [0G Storage] RAG Memory Proof: ${storageStatus}`));
    console.log(chalk.cyan(`      - [Uniswap] Real On-chain Token Transfers (Sepolia)`));
    console.log(chalk.cyan(`      - [Chainlink] CRE Workflow Orchestration`));

    console.log(chalk.yellow(`\n🔍 FINAL VERIFICATION LINKS:`));
    console.log(`   - Uniswap (Sepolia): https://sepolia.etherscan.io/tx/${txHash}`);
    
    if (analysis?.storageHash && !analysis.storageHash.startsWith("local-")) {
      console.log(`   - 0G Storage (Root): https://chainscan-galileo.0g.ai/tx/${analysis.storageHash}`);
    } else {
      console.log(`   - 0G Storage (Root): [Network Offline - Data saved locally]`);
    }
  }
}
