import "dotenv/config";
import { ethers } from "ethers";
import chalk from "chalk";

async function deposit() {
  const vaultAddress = process.env.STRATEGY_VAULT_ADDRESS;
  const privateKey = process.env.USER_PRIVATE_KEY;
  const rpcUrl = process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org";

  if (!vaultAddress || !privateKey) {
    console.error(chalk.red("❌ Error: STRATEGY_VAULT_ADDRESS or USER_PRIVATE_KEY is missing in .env"));
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const amount = ethers.parseEther("0.01");

  console.log(chalk.cyan(`\n🏦 [Deposit Tool] Initializing 0.05 ETH deposit...`));
  console.log(`   Source Wallet : ${wallet.address}`);
  console.log(`   Target Vault  : ${vaultAddress}`);

  try {
    const tx = await wallet.sendTransaction({
      to: vaultAddress,
      value: amount,
      gasLimit: 30000
    });

    console.log(chalk.yellow(`📡 [Deposit Tool] Broadcasting transaction. Hash: ${tx.hash}`));
    
    const receipt = await tx.wait();
    if (receipt && receipt.status === 1) {
      console.log(chalk.green(`\n✅ SUCCESS: 0.5 ETH has been safely deposited into StrategyVault!`));
      console.log(`   Explorer Link : https://sepolia.etherscan.io/tx/${tx.hash}`);

      const balance = await provider.getBalance(vaultAddress);
      console.log(chalk.magenta(`   Current Vault Balance: ${ethers.formatEther(balance)} ETH`));
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ FAILED to deposit: ${error.message}`));
  }
}

deposit().catch(console.error);
