import "dotenv/config";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
  const abi = [
    "function getStrategy(bytes32) view returns (tuple(address agent, bytes32 commitmentHash, string strategyUri, bool isPrivate, uint256 timestamp, string txExecuted))"
  ];
  const vault = new ethers.Contract("0xb5C043ab5e7a929885272CFEb3246D254460b293", abi, provider);
  const hash = "0xf31b2589b720cc53907b71c4f52e548046ba055ec9b3e0d2120e09225cc4395f";
  
  const record = await vault.getStrategy(hash);
  console.log("Agent:", record.agent, record[0]);
}

main().catch(console.error);
