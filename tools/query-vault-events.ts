import "dotenv/config";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  const vaultAbi = [
    "event Deposited(address indexed user, uint256 amount)",
    "event StrategyExecuted(address indexed user, string action, uint256 amount)"
  ];
  const vault = new ethers.Contract(process.env.STRATEGY_VAULT_ADDRESS!, vaultAbi, provider);

  // Use a hardcoded recent block to avoid "range too large" errors
  const currentBlock = await provider.getBlockNumber();
  const startBlock = 5664120; // 0G Testnets / Sepolia blocks where we deployed

  const events = await vault.queryFilter("*", currentBlock - 300, currentBlock);

  console.log("Vault Events from last 300 blocks:");
  events.forEach((evt: any) => {
    if (evt.eventName === "Deposited") {
      console.log(`[+] Deposited: ${ethers.formatEther(evt.args.amount)} ETH`);
    } else if (evt.eventName === "StrategyExecuted") {
      console.log(`[-] AI Executed [${evt.args.action}]: -${ethers.formatEther(evt.args.amount)} ETH`);
    }
  });
}

main().catch(console.error);
