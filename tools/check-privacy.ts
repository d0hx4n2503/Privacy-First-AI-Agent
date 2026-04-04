import "dotenv/config";
import { ethers } from "ethers";
import chalk from "chalk";

async function checkPrivacy() {
  const privacyAddress = process.env.PRIVACY_VAULT_ADDRESS;
  const zgRpc = process.env.ZG_RPC_URL || "https://rpc-testnet.0g.ai";

  if (!privacyAddress) {
    console.error(chalk.red("❌ Error: PRIVACY_VAULT_ADDRESS is missing in .env"));
    return;
  }

  const provider = new ethers.JsonRpcProvider(zgRpc);
  console.log(chalk.cyan(`\n🔐 [Privacy Tracker] Investigating 0G PrivacyVault @ ${privacyAddress}\n`));

  const vaultAbi = [
    "event ExecutionLinked(bytes32 indexed commitmentHash, string txHash)"
  ];
  const vaultContract = new ethers.Contract(privacyAddress, vaultAbi, provider);

  try {
    // We look for events from the very beginning of this contract deployment
    const filter = vaultContract.filters.ExecutionLinked();
    const events = await vaultContract.queryFilter(filter, 0, "latest");

    if (events.length === 0) {
      console.log(chalk.yellow("⚠️  No privacy records found in the CURRENT contract."));
      console.log(chalk.gray(`   Note: If you redeployed recently, previous records stay in the OLD contract address.`));
    } else {
      console.log(chalk.magenta(`📜 Verified ${events.length} Proofs on 0G Newton:\n`));
      
      for (const event of events) {
        // Casting as any to access args easily
        const { commitmentHash, txHash } = (event as any).args;
        console.log(`${chalk.blue(`[PROOF]`)} Strategy Committed: ${commitmentHash}`);
        console.log(`        👉 Real-World TX: ${chalk.green(txHash)}`);
        console.log(chalk.gray(`        --------------------------------------------------`));
      }
    }
  } catch (e: any) {
    console.error(chalk.red(`❌ RPC Error while querying 0G: ${e.message}`));
  }
}

checkPrivacy().catch(console.error);
