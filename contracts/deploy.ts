import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  agentRegistry: string;
  privacyVault: string;
  deployedAt: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("🚀 Deploying Privacy DeFi Agent contracts...");
  console.log(`   Network : ${network.name} (chainId: ${network.chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`   Balance : ${ethers.formatEther(balance)} native\n`);

  // ── Deploy AgentRegistry ─────────────────────────────────────────────
  console.log("📝 Deploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddr = await agentRegistry.getAddress();
  console.log(`   ✅ AgentRegistry deployed at: ${agentRegistryAddr}`);

  // ── Deploy PrivacyVault ──────────────────────────────────────────────
  console.log("🔒 Deploying PrivacyVault...");
  const PrivacyVault = await ethers.getContractFactory("PrivacyVault");
  const privacyVault = await PrivacyVault.deploy();
  await privacyVault.waitForDeployment();
  const privacyVaultAddr = await privacyVault.getAddress();
  console.log(`   ✅ PrivacyVault deployed at: ${privacyVaultAddr}`);

  // ── Save deployment info ─────────────────────────────────────────────
  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    agentRegistry: agentRegistryAddr,
    privacyVault: privacyVaultAddr,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${outFile}`);

  // ── Summary ──────────────────────────────────────────────────────────
  console.log("\n📋 Deployment Summary:");
  console.log("   ┌─────────────────────────────────────────────────────────┐");
  console.log(`   │ AgentRegistry : ${agentRegistryAddr}`);
  console.log(`   │ PrivacyVault  : ${privacyVaultAddr}`);
  console.log(`   │ Network       : ${network.name} (${network.chainId})`);
  console.log("   └─────────────────────────────────────────────────────────┘");
  console.log("\n🔗 Verify on Hashscan (Hedera Testnet):");
  console.log(`   https://hashscan.io/testnet/contract/${agentRegistryAddr}`);
  console.log(`   https://hashscan.io/testnet/contract/${privacyVaultAddr}`);
  console.log("\n🔗 Verify on 0G Explorer:");
  console.log(`   https://chainscan-galileo.0g.ai/address/${agentRegistryAddr}`);
  console.log(`   https://chainscan-galileo.0g.ai/address/${privacyVaultAddr}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
