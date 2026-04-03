import "dotenv/config";
import { ethers } from "ethers";

async function check() {
  const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
  const contract = new ethers.Contract(
    process.env.INFT_CONTRACT_ADDRESS!,
    [
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
    ],
    provider
  );
  const owner = "0x335145400C12958600C0542F9180e03B917F7BbB";
  try {
    const bal = await contract.balanceOf(owner);
    console.log(`👤 Owner balance: ${bal.toString()} iNFTs`);
    if (bal > 0n) {
      const tokenId = await contract.tokenOfOwnerByIndex(owner, bal - 1n);
      console.log(`🔥 LATEST ID: ${tokenId.toString()}`);
    }
  } catch (e) {
    console.log("❌ Contract error (might not support enumerable): " + e);
  }
}
check();
