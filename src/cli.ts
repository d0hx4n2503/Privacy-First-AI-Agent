#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { Orchestrator } from "./orchestrator";
import { iNFTMinter, iNFTMetadata } from "./agent/inft";
import { HCS14AgentIdentity } from "./hedera/hcs14";
import chalk from "chalk";

const program = new Command();

program
  .name("privacy-agent")
  .description("Privacy-first AI Agent for DeFi - Hackathon CLI")
  .version("1.0.0");

// ── Command: START ───────────────────────────────────────────────────
program
  .command("start")
  .description("Start the background agent listening for Naryo events")
  .option("--auto-prompt", "Automatically answer privacy prompts based on AI risk score")
  .action(async (options) => {
    console.log(chalk.green("Starting agent..."));
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

// ── Command: MINT INFT ───────────────────────────────────────────────
program
  .command("mint-inft")
  .description("Mint this AI Agent as an ERC-7857 iNFT on 0G Chain")
  .action(async () => {
    const minter = new iNFTMinter();
    const metadata: iNFTMetadata = {
      agentId: process.env.HEDERA_OPERATOR_ID || "unknown",
      framework: "OpenClaw",
      capabilities: ["defi-strategy", "private-inference"],
      hcs14TopicId: process.env.AGENT_TOPIC_ID || "",
      createdAt: new Date().toISOString()
    };
    
    await minter.mint(metadata);
    process.exit(0);
  });

// ── Command: REGISTER AGENT ──────────────────────────────────────────
program
  .command("register-agent")
  .description("Register a new HCS-14 Universal Agent ID on Hedera Testnet")
  .action(async () => {
    const identity = new HCS14AgentIdentity();
    await identity.registerAgent("PrivacyAgent_CLI");
    process.exit(0);
  });

program.parse();
