import fs from "fs";
import path from "path";
import solc from "solc";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function compileAndDeploy() {
  console.log("🚀 Starting raw deployment to 0G Testnet...");

  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing ZG_PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`👤 Deployer: ${wallet.address}`);

  // ── Compile ─────────────────────────────────────────────
  const registryPath = path.resolve("contracts", "AgentRegistry.sol");
  const vaultPath = path.resolve("contracts", "PrivacyVault.sol");
  const inftPath = path.resolve("contracts", "INFT.sol");
  
  const sourceRegistry = fs.readFileSync(registryPath, "utf8");
  const sourceVault = fs.readFileSync(vaultPath, "utf8");
  const sourceInft = fs.readFileSync(inftPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "AgentRegistry.sol": { content: sourceRegistry },
      "PrivacyVault.sol": { content: sourceVault },
      "INFT.sol": { content: sourceInft }
    },
    settings: {
      outputSelection: { "*": { "*": ["*"] } },
    },
  };

  console.log("⏳ Compiling contracts...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    output.errors.forEach((err: any) => console.error(err.formattedMessage));
    if (output.errors.some((e: any) => e.severity === "error")) {
      process.exit(1);
    }
  }

  // ── Deploy Agent Registry ───────────────────────────────
  const regMeta = output.contracts["AgentRegistry.sol"]["AgentRegistry"];
  const regFactory = new ethers.ContractFactory(regMeta.abi, regMeta.evm.bytecode.object, wallet);
  console.log("Deploying AgentRegistry...");
  const regContract = await regFactory.deploy();
  await regContract.waitForDeployment();
  const regAddress = await regContract.getAddress();
  console.log(`✅ AgentRegistry deployed at: ${regAddress}`);

  // ── Deploy Privacy Vault ────────────────────────────────
  const vaultMeta = output.contracts["PrivacyVault.sol"]["PrivacyVault"];
  const vaultFactory = new ethers.ContractFactory(vaultMeta.abi, vaultMeta.evm.bytecode.object, wallet);
  console.log("Deploying PrivacyVault...");
  const vaultContract = await vaultFactory.deploy();
  await vaultContract.waitForDeployment();
  const vaultAddress = await vaultContract.getAddress();
  console.log(`✅ PrivacyVault deployed at: ${vaultAddress}`);

  // ── Deploy INFT ─────────────────────────────────────────
  const inftMeta = output.contracts["INFT.sol"]["INFT"];
  const inftFactory = new ethers.ContractFactory(inftMeta.abi, inftMeta.evm.bytecode.object, wallet);
  console.log("Deploying INFT...");
  const inftContract = await inftFactory.deploy();
  await inftContract.waitForDeployment();
  const inftAddress = await inftContract.getAddress();
  console.log(`✅ INFT deployed at: ${inftAddress}`);

  console.log(`\n🔍 View on Explorer:`);
  console.log(`   AgentRegistry: https://chainscan-galileo.0g.ai/address/${regAddress}`);
  console.log(`   PrivacyVault:  https://chainscan-galileo.0g.ai/address/${vaultAddress}`);
  console.log(`   INFT:          https://chainscan-galileo.0g.ai/address/${inftAddress}`);
}

compileAndDeploy().catch(console.error);
