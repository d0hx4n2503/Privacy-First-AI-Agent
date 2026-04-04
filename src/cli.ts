#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { Orchestrator } from "./core/orchestrator";
import { iNFTMinter, iNFTMetadata } from "./services/zero-g/inft";
import { PoolScreener } from "./services/uniswap/screener";
import { PoolReporter } from "./services/uniswap/reporter";
import chalk from "chalk";
import readlineSync from "readline-sync";
import path from "path";
import fs from "fs";

const program = new Command();

program
  .name("privacy-agent")
  .description("Privacy-first AI Agent for DeFi - Hackathon CLI")
  .version("1.0.0");

// ── Command: START (Live Testnet) ────────────────────────────────────
program
  .command("start")
  .description("Start the autonomous agent loop (Scans market continuously)")
  .option("--interval <ms>", "Scan interval", "60000")
  .action(async (options) => {
    console.log(chalk.bold.cyan("\n======================================================="));
    console.log(chalk.bold.cyan("   🤖  GROQ ALPHA AI — Active Autonomous Mode"));
    console.log(chalk.bold.cyan("=======================================================\n"));
    
    const orchestrator = new Orchestrator();
    await orchestrator.start();
  });

// ── Command: ANALYZE POOLS (Comparative Analysis) ────────────────────
program
  .command("analyze")
  .alias("scout-market")
  .description("Comparative Analysis: Ranks multiple pools and suggests investment")
  .requiredOption("--file <path>", "Path to pools JSON file")
  .option("--top <n>", "Show top N results", "5")
  .option("--export", "Export result to report.json", false)
  .option("--auto-invest", "Trigger deposit for the #1 ranked pool", false)
  .action(async (options) => {
    console.log(chalk.bold.cyan("\n======================================================="));
    console.log(chalk.bold.cyan("   🤖  GROQ ALPHA AI — Strategic Market Analysis"));
    console.log(chalk.bold.cyan("=======================================================\n"));

    try {
      const screener = new PoolScreener();
      const reporter = new PoolReporter();

      // 1. Load pool list
      const result = await screener.screenFromFile(options.file);

      // 2. Print rich ranked results table
      reporter.print(result, parseInt(options.top, 10));

      // 3. Export if requested
      if (options.export) {
        await reporter.exportJSON(result);
      }

      // 4. Interactive selection
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
            const rankedName = result.aiResult.rankings[idx].poolName;
            selectedPool = result.inputPools.find(p => p.name === rankedName);
          }
        }
      }

      if (selectedPool) {
        // 5. Select amount (Default: 0.001 ETH)
        console.log(chalk.bold.yellow(`\n💰 Enter investment amount (Default: 0.001):`));
        const amountStr = readlineSync.question("Amount: ") || "0.001";
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
          console.log(chalk.red("Invalid amount. skipping investment."));
          return;
        }

        console.log(chalk.bold.magenta(`\n🚀 Routing ${selectedPool.name} into execution pipeline...`));
        const orchestrator = new Orchestrator();
        await orchestrator.analyzePoolList([selectedPool], true, true, amountStr);
      }

      console.log(chalk.green("\n✅ Done."));
    } catch (error: any) {
      console.error(chalk.red("\n❌ [analyze] Failed:"), error.message || error);
      process.exit(1);
    }
  });

// ── Command: SCOUT (Analysis Only + On-Chain Log) ────────────────────
program
  .command("scout")
  .description("Deep Research Only: Scans pools and logs expert reasoning on 0G Chain")
  .requiredOption("--file <path>", "Path to pools JSON file")
  .option("--dry-run", "Skip on-chain logging", false)
  .action(async (options) => {
    if (options.dryRun) process.env.DRY_RUN = "true";
    else process.env.DRY_RUN = "false";

    console.log(chalk.bold.cyan(`\n📈 [Groq Alpha AI] Generative Portfolio Strategy Analysis`));
    try {
      const orchestrator = new Orchestrator();
      const pools = JSON.parse(fs.readFileSync(path.resolve(options.file), "utf-8"));
      console.log(`   Analyzed: ${pools.length} pools  |  ${new Date().toISOString()}\n`);
      await orchestrator.scoutPools(pools);
    } catch (error: any) {
      console.error(chalk.red("\n❌ [Scout] Failed:"), error.message || error);
      process.exit(1);
    }
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
    }

    try {
      const orchestrator = new Orchestrator();
      const result = await orchestrator.withdraw(tokenId);
      if (result && result.status === "success") {
        console.log(chalk.green(`\n✅ [CLI] Withdrawal of #${tokenId} successful.`));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ [CLI] Withdrawal failed:`), error.message || error);
      process.exit(1);
    }
  });

// ── Command: MINT INFT (Verifiable Reputation) ────────────────────
program
  .command("mint-inft")
  .description("Mint a Verifiable Identity (iNFT) on 0G Chain (Newton Testnet)")
  .requiredOption("--uri <uri>", "Metadata URI for the agent/identity (IPFS or 0G Storage Hash)")
  .action(async (options) => {
    console.log(chalk.bold.blue("\n💎 Generating Verifiable Identity (iNFT)..."));
    try {
      const minter = new iNFTMinter();
      const metadata: iNFTMetadata = {
        agentId: "groq-alpha-001",
        framework: "OpenClaw",
        capabilities: ["defi-strategy", "private-inference", "autonomous-trading"],
        createdAt: new Date().toISOString(),
        storageUri: options.uri
      };
      
      const result = await minter.mint(metadata);
      console.log(chalk.green(`\n✅ iNFT minted successfully! Token ID: ${result.tokenId}`));
      console.log(chalk.cyan(`   TX: ${result.txHash}`));
    } catch (error: any) {
      console.error(chalk.red("\n❌ [iNFT] Minting failed:"), error.message || error);
    }
  });

program.parse(process.argv);
