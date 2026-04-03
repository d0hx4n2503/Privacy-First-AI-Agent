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
    console.log(`💰 USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);

    // ── Check Uniswap V3 LP Positions ────────────────────────────────
    console.log(`\n🖼️  Checking Uniswap V3 LP Positions...`);
    const positionManagerAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";
    const positionManagerAbi = [
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
      "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
    ];
    const positionManager = new ethers.Contract(positionManagerAddress, positionManagerAbi, provider);

    const nftCount = await positionManager.balanceOf(address);
    console.log(`📊 Total LP NFTs: ${nftCount.toString()}`);

    if (nftCount > 0n) {
      console.log("-------------------------------------------------------");
      for (let i = 0; i < nftCount; i++) {
        const tokenId = await positionManager.tokenOfOwnerByIndex(address, i);
        const pos = await positionManager.positions(tokenId);
        
        console.log(`📍 Position ID : ${tokenId.toString()}`);
        console.log(`   Tokens      : ${pos.token0.slice(0, 6)}... / ${pos.token1.slice(0, 6)}...`);
        console.log(`   Liquidity   : ${pos.liquidity.toString()}`);
        console.log("-------------------------------------------------------");
      }
    }

    if (balanceWei === 0n && usdcBalance === 0n && nftCount === 0n) {
      console.log(`\n⚠️ No assets found on this address.`);
    }

  } catch (error: any) {
    console.error("❌ Error fetching balance:", error.message);
  }
}

checkBalance().catch(console.error);
