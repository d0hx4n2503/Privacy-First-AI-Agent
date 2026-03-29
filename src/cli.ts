#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { Orchestrator } from "./orchestrator";
import { iNFTMinter, iNFTMetadata } from "./agent/inft";
import { PoolScreener } from "./pools/screener";
import { PoolReporter } from "./pools/reporter";
import chalk from "chalk";

const program = new Command();

program
  .name("privacy-agent")
  .description("Privacy-first AI Agent for DeFi - Hackathon CLI")
  .version("1.0.0");

// ── Command: START (Live Testnet) ────────────────────────────────────
program
  .command("start")
  .description("Start the live agent listening for REAL on-chain events (0G + Unichain)")
  .option("--auto-prompt", "Automatically answer privacy prompts based on AI risk score")
  .action(async (options) => {
    process.env.DRY_RUN = "false";
    process.env.SIMULATE = "false";
    process.env.MOCK_USER_INPUT = "false";
    
    console.log(chalk.green("🚀 Starting agent in LIVE TESTNET mode..."));
    const orchestrator = new Orchestrator();
    await orchestrator.start(options.autoPrompt);
  });

// ── Command: DEMO (Dry Run) ──────────────────────────────────────────
program
  .command("demo")
  .description("Run a dry-run demo bypassing real transaction signatures")
  .option("--auto-prompt", "Automatically answer privacy prompts", true)
  .action(async (options) => {
    process.env.DRY_RUN = "true";
    process.env.SIMULATE = "true";
    process.env.MOCK_USER_INPUT = "true";
    
    console.log(chalk.bgMagenta(" 🎭 DRY RUN / DEMO MODE "));
    const orchestrator = new Orchestrator();
    await orchestrator.start(options.autoPrompt);
  });

// ── Command: TRIGGER TEST ────────────────────────────────────────────
program
  .command("trigger-test [tokenIn] [tokenOut]")
  .description("Force a testnet event through the live pipeline (Real transactions)")
  .action(async (tokenIn, tokenOut) => {
    process.env.DRY_RUN = "false";
    process.env.SIMULATE = "false";
    process.env.MOCK_USER_INPUT = "false";
    
    const tIn = tokenIn || "ETH";
    const tOut = tokenOut || "USDC";

    console.log(chalk.magenta(`🧪 Triggering manual TESTNET event: ${tIn} → ${tOut}`));
    try {
      const orchestrator = new Orchestrator();
      await orchestrator.triggerManualEvent(tIn, tOut);
      console.log(chalk.green("\n✅ [Trigger Test] Pipeline finished successfully."));
    } catch (error: any) {
      console.error(chalk.red("\n❌ [Trigger Test] Pipeline failed:"), error.message || error);
    }
    
    console.log(chalk.gray("\nWaiting for all tasks to settle before exit..."));
    setTimeout(() => process.exit(0), 3000);
  });

// ── Command: MINT INFT ───────────────────────────────────────────────
program
  .command("mint-inft")
  .description("Mint this AI Agent as an ERC-7857 iNFT on 0G Chain")
  .action(async () => {
    const minter = new iNFTMinter();
    const metadata: iNFTMetadata = {
      agentId: process.env.ZG_PRIVATE_KEY ? "0g-agent" : "unknown",
      framework: "OpenClaw",
      capabilities: ["defi-strategy", "private-inference"],
      createdAt: new Date().toISOString()
    };
    
    await minter.mint(metadata);
    process.exit(0);
  });

// ── Command: ANALYZE POOLS ───────────────────────────────────────────
program
  .command("analyze-pools")
  .description("Send a pool list to 0G AI for comparative ranking — picks the best pool to invest in")
  .requiredOption("--file <path>", "Path to pool candidates JSON file (see examples/pools.json)")
  .option("--top <n>", "Show top N pools in results table", "5")
  .option("--auto-invest", "Automatically execute a swap into the top-ranked pool after analysis")
  .option("--export", "Export the full AI ranking report to a JSON file")
  .option("--dry-run", "Skip real transactions; 0G Compute calls replaced by local fallback")
  .action(async (options) => {
    // Set env flags BEFORE any module initialises so constructors pick them up
    if (options.dryRun) {
      process.env.DRY_RUN         = "true";
      process.env.SIMULATE        = "true";
      process.env.MOCK_USER_INPUT = "true";
    } else {
      process.env.DRY_RUN         = "false";
      process.env.MOCK_USER_INPUT = "false";
    }

    console.log(chalk.bold.cyan("\n======================================================="));
    console.log(chalk.bold.cyan("   🤖  0G AI Pool Screener  —  Comparative Analysis"));
    console.log(chalk.bold.cyan("=======================================================\n"));

    if (options.dryRun) {
      console.log(chalk.yellow("   [DRY RUN] 0G Compute calls skipped — local fallback will be used.\n"));
    }

    try {
      const screener = new PoolScreener();
      const reporter = new PoolReporter();

      // 1. Load pool list → send ALL pools to 0G AI in ONE comparative prompt
      const result = await screener.screenFromFile(options.file);

      // 2. Print rich ranked results table with AI reasoning per pool
      reporter.print(result, parseInt(options.top, 10));

      // 3. Optionally export JSON report for audit / downstream use
      if (options.export) {
        await reporter.exportJSON(result);
      }

      // 4. Optionally auto-invest into the top-ranked pool via full pipeline
      if (options.autoInvest) {
        const top = result.topPool;
        console.log(chalk.bold.magenta(`\n🚀 [Auto-Invest] Routing top pool ${top.name} into execution pipeline...`));
        const orchestrator = new Orchestrator();
        await orchestrator.analyzePoolList([top], true);
      }

      console.log(chalk.green("\n✅ Pool analysis complete."));
    } catch (error: any) {
      console.error(chalk.red("\n❌ [analyze-pools] Failed:"), error.message || error);
      process.exit(1);
    }

    setTimeout(() => process.exit(0), 1000);
  });



program.parse();
