#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { Orchestrator } from "./core/orchestrator";
import { iNFTMinter, iNFTMetadata } from "./services/zero-g/inft";
import { PoolScreener } from "./services/uniswap/screener";
import { PoolReporter } from "./services/uniswap/reporter";
import chalk from "chalk";
import readlineSync from "readline-sync";

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
  .alias("analyze")
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

      // 4. Interactive selection (if not auto-investing already)
      let selectedPool = null;
      let privacyChoice = true;

      if (options.autoInvest) {
        selectedPool = result.topPool;
        console.log(chalk.bold.magenta(`\n🚀 [Auto-Invest] Selecting top-ranked pool: ${selectedPool.name}`));
      } else {
        const poolCount = Math.min(result.inputPools.length, parseInt(options.top, 10));
        console.log(chalk.bold.yellow(`\n👉 Select a pool to invest in (1-${poolCount}) or 'q' to quit:`));
        const choice = readlineSync.question("Selection: ");

        if (choice.toLowerCase() === 'q') {
          console.log(chalk.gray("Analysis complete. No investment selected."));
        } else {
          const idx = parseInt(choice, 10) - 1;
          if (idx >= 0 && idx < result.inputPools.length) {
            // Match the pool by name in the ranked list or just use input list order?
            // Actually, reporter.print shows the AI ranked list. 
            // result.aiResult.rankings contains the names in order.
            const rankedName = result.aiResult.rankings[idx].poolName;
            selectedPool = result.inputPools.find(p => p.name === rankedName);
          } else {
            console.log(chalk.red("Invalid selection. skipping investment."));
          }
        }
      }

      if (selectedPool) {
        // 5. Ask for Privacy Mode
        console.log(chalk.bold.cyan("\n🛡️  Select Execution Mode:"));
        console.log(" [1] Private (Shielded via 0G + TEE) - Recommended");
        console.log(" [2] Public  (Transparent on-chain)");
        const mode = readlineSync.question("Choice (1/2, default 1): ");
        privacyChoice = mode !== '2';

        // 5. Select amount
        console.log(chalk.bold.yellow(`\n💰 Enter investment amount (Default: 1.0):`));
        const amountStr = readlineSync.question("Amount: ") || "1.0";
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
          console.log(chalk.red("Invalid amount. skipping investment."));
          return;
        }

        console.log(chalk.bold.magenta(`\n🚀 Routing ${selectedPool.name} into execution pipeline...`));
        const orchestrator = new Orchestrator();
        await orchestrator.analyzePoolList([selectedPool], true, privacyChoice, amountStr);
      }

      console.log(chalk.green("\n✅ Done."));
    } catch (error: any) {
      console.error(chalk.red("\n❌ [analyze-pools] Failed:"), error.message || error);
      process.exit(1);
    }

    setTimeout(() => process.exit(0), 1000);
  });

// ── Command: WITHDRAW POOL ───────────────────────────────────────────
program
  .command("withdraw-pool <tokenId>")
  .alias("withdraw")
  .description("Withdraw liquidity from a Uniswap V3 position by Token ID")
  .option("--dry-run", "Skip real transactions", false)
  .action(async (tokenId, options) => {
    if (options.dryRun) {
      process.env.DRY_RUN = "true";
      process.env.SIMULATE = "true";
    } else {
      process.env.DRY_RUN = "false";
    }

    try {
      const orchestrator = new Orchestrator();
      const result = await orchestrator.withdraw(tokenId);
      
      if (result && result.status === "success") {
        console.log(chalk.green(`\n✅ [CLI] Withdrawal of #${tokenId} successful.`));
      } else {
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ [CLI] Withdrawal failed:`), error.message || error);
      process.exit(1);
    }

    process.exit(0);
  });
// ── Command: BALANCE ────────────────────────────────────────────────
program
  .command("balance")
  .description("Check wallet balances (ETH, USDC) and Uniswap V3 positions")
  .action(async () => {
    const { LiquidityManager } = require("./services/uniswap/liquidity");
    const chalk = require("chalk");
    
    console.log(chalk.bold.cyan("\n======================================================="));
    console.log(chalk.bold.cyan("   💰  Wallet & Liquidity Portfolio Overview"));
    console.log(chalk.bold.cyan("=======================================================\n"));

    try {
      const lpManager = new LiquidityManager();
      const results = await lpManager.getBalancesAndPositions();

      console.log(chalk.white(`👤 Address: ${results.address}`));
      console.log(chalk.gray("───────────────────────────────────────────────────────"));
      console.log(chalk.green(`💵 ETH Balance  : ${results.eth} ETH`));
      console.log(chalk.green(`💵 USDC Balance : ${results.usdc} USDC`));
      console.log(chalk.gray("───────────────────────────────────────────────────────"));

      if (results.positions.length > 0) {
        console.log(chalk.bold.yellow("\n🖼️  Active Uniswap V3 Positions:"));
        results.positions.forEach((pos: any) => {
          console.log(chalk.white(`📍 ID: ${pos.tokenId}`));
          console.log(chalk.gray(`   Tokens    : ${pos.token0.slice(0, 6)}... / ${pos.token1.slice(0, 6)}...`));
          console.log(chalk.gray(`   Liquidity : ${pos.liquidity}`));
          console.log(chalk.gray(`   Fee Tier  : ${Number(pos.fee) / 10000}%`));
          console.log(chalk.gray("   ─────────"));
        });
      } else {
        console.log(chalk.gray("\n📭 No active Uniswap V3 positions found."));
      }

    } catch (error: any) {
      console.error(chalk.red("\n❌ Failed to fetch balance:"), error.message || error);
    }

    process.exit(0);
  });

program.parse();
