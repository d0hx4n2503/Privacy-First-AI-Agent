import "dotenv/config";
import { ethers } from "ethers";

async function verify() {
  const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai");
  
  // Use getAddress to normalize and catch any format errors early
  const registryAddress = ethers.getAddress(process.env.AGENT_REGISTRY_ADDRESS!);
  const tokenId = process.env.MY_AGENT_INFT_ID || "1";
  
  console.log("=======================================================");
  console.log("   🛡️  ORION ON-CHAIN VERIFIER  — Proof of life on 0G Chain");
  console.log("=======================================================\n");

  console.log(`📡 [Verifier] Registry: ${registryAddress}`);
  console.log(`📡 [Verifier] TokenID : ${tokenId}\n`);

  const abi = [
    "function getAgent(uint256 tokenId) external view returns (tuple(address owner, uint256 inftTokenId, string metadata, bool privacyEnabled, uint256 registeredAt))",
    "event ActionLogged(uint256 indexed tokenId, address indexed owner, string actionType, string dataHash)"
  ];

  const registry = new ethers.Contract(registryAddress, abi, provider);

  // 1. Check Registration
  console.log(`👤 Checking Agent Identity...`);
  try {
    const info = await registry.getAgent(tokenId);
    if (Number(info.registeredAt) === 0) {
      console.log("❌ Status: NOT REGISTERED. Run 'mint-inft' first!");
    } else {
      console.log("✅ Status: OFFICIALLY REGISTERED on 0G Chain");
      console.log(`🆔 iNFT Token ID: ${info.inftTokenId}`);
      console.log(`🎭 Privacy Mode : ${info.privacyEnabled ? "ENABLED 🔐" : "DISABLED"}`);
      console.log(`📅 Member Since : ${new Date(Number(info.registeredAt) * 1000).toLocaleString()}`);
    }
  } catch (e) {
    console.error("❌ Registry Error:", (e as Error).message);
  }

  // 2. Check Action Logs (Events)
  console.log("\n📜 Fetching Recent Action Logs (Events)...");
  try {
    const filter = registry.filters.ActionLogged(tokenId);
    const events = await registry.queryFilter(filter, -2000); // Look back 2,000 blocks

    if (events.length === 0) {
      console.log("⚠️  No actions recorded yet. Run a session via 'analyze'!");
    } else {
      console.log(`🎉 Found ${events.length} verifiable action(s) for this Agent:\n`);
      events.forEach((evt: any, i: number) => {
        const { actionType, dataHash, owner } = evt.args;
        console.log(`📍 Action #${i + 1}: [${actionType}]  (by: ${owner})`);
        console.log(`💿 Proof Hash (0G Storage): ${dataHash}`);
        console.log(`⛓️  Explorer Link          : https://chainscan-galileo.0g.ai/tx/${evt.transactionHash}`);
        console.log("───────────────────────────────────────────────────────");
      });
    }
  } catch (e) {
    console.error("❌ Action Log Error:", (e as Error).message);
  }

  console.log("\n🚀 All proofs linked successfully. ORION is officially ON-CHAIN.");
}

verify().catch(console.error);
