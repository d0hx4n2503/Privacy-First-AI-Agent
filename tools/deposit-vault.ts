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
  const amountStr = process.argv[2] || "0.01";
  const amount = ethers.parseEther(amountStr);

  console.log(chalk.cyan(`\n🏦 [Deposit Tool] Initializing ${amountStr} ETH deposit...`));
  console.log(`   Source Wallet : ${wallet.address}`);
  console.log(`   Target Vault  : ${vaultAddress}`);

  try {
    const vaultAbi = ["function deposit() external payable"];
    const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, wallet);

    const tx = await vaultContract.deposit({
      value: amount
    });

    console.log(chalk.yellow(`📡 [Deposit Tool] Broadcasting transaction. Hash: ${tx.hash}`));
    
    const receipt = await tx.wait();
    if (receipt && receipt.status === 1) {
      console.log(chalk.green(`\n✅ SUCCESS: ${amountStr} ETH has been safely deposited into StrategyVault!`));
      console.log(`   Explorer Link : https://sepolia.etherscan.io/tx/${tx.hash}`);

      const balance = await provider.getBalance(vaultAddress);
      console.log(chalk.magenta(`   Current Vault Balance: ${ethers.formatEther(balance)} ETH`));
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ FAILED to deposit: ${error.message}`));
  }
}

deposit().catch(console.error);
