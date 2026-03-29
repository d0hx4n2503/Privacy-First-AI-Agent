import "dotenv/config";
import { ethers } from "ethers";

async function checkBalance() {
  const rpcUrl = process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org";
  const privateKey = process.env.TRADER_PRIVATE_KEY;

  console.log(`📡 Connecting to RPC: ${rpcUrl}`);

  if (!privateKey) {
    console.error("❌ Mising TRADER_PRIVATE_KEY in .env");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();

    console.log(`👤 Derived Wallet Address: ${address}`);
    
    // Check balance
    console.log(`⌛ Fetching ETH balance...`);
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);

    console.log(`\n💰 Balance on this Network: ${balanceEth} ETH`);
    
    // Check USDC
    const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const usdcAbi = ["function balanceOf(address account) external view returns (uint256)"];
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
    const usdcBalance = await usdcContract.balanceOf(address);
    // USDC has 6 decimals on Sepolia
    console.log(`💰 USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);

    if (balanceWei === 0n && usdcBalance === 0n) {
      console.log(`\n⚠️ The balance is exactly 0. Warning:`);
      console.log(`1. Double check if this is the exact wallet Address that holds the 5 ETH.`);
      console.log(`2. If the 5 ETH is on L1 Sepolia, but this script is checking Unichain Sepolia, it will show 0.`);
      console.log(`3. Check if your TRADER_PRIVATE_KEY is correct in .env`);
    }

  } catch (error: any) {
    console.error("❌ Error fetching balance:", error.message);
  }
}

checkBalance().catch(console.error);
