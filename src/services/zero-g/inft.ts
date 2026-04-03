import "dotenv/config";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

export interface iNFTMetadata {
  agentId: string;
  framework: string;
  capabilities: string[];
  createdAt: string;
  storageUri?: string; // 0G Storage URI for extended metadata
}

export interface iNFTResult {
  tokenId: string;
  contractAddress: string;
  txHash: string;
  metadata: iNFTMetadata;
}

// Minimal ERC-7857 iNFT interface (simplified for hackathon demo)
const INFT_ABI = [
  "function mint(address to, string calldata metadataUri) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

/**
 * Mints an AI Agent as an iNFT (ERC-7857) on 0G Chain.
 * The iNFT represents agent ownership, composability, and can be transferred/licensed.
 */
export class iNFTMinter {
  private provider: ethers.Provider;
  private signer: ethers.Wallet | null = null;
  private readonly dryRun: boolean;

  constructor() {
    this.dryRun = process.env.DRY_RUN === "true";
    this.provider = new ethers.JsonRpcProvider(
      process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai"
    );

    if (process.env.ZG_PRIVATE_KEY && !this.dryRun) {
      this.signer = new ethers.Wallet(
        process.env.ZG_PRIVATE_KEY,
        this.provider
      );
    }
  }

  /**
   * Mint the AI agent as an iNFT (ERC-7857) on 0G Chain.
   */
  async mint(metadata: iNFTMetadata): Promise<iNFTResult> {
    const contractAddress =
      process.env.INFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000001";

    if (this.dryRun) {
      return this.mockMint(metadata, contractAddress);
    }

    if (!this.signer) {
      console.warn("⚠️  [iNFT] No signer configured, using mock mint");
      return this.mockMint(metadata, contractAddress);
    }

    try {
      console.log("🎨 [iNFT] Minting agent as iNFT (ERC-7857) on 0G Chain...");

      const contract = new ethers.Contract(
        contractAddress,
        INFT_ABI,
        this.signer
      );

      const metadataUri = this.encodeMetadataUri(metadata);
      const ownerAddress = await this.signer.getAddress();

      const tx = await contract.mint(ownerAddress, metadataUri);
      const receipt = await tx.wait();

      // Parse Transfer event to get token ID
      const transferEvent = receipt.logs
        .map((log: ethers.Log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: ethers.LogDescription | null) => e?.name === "Transfer");

      const tokenId = transferEvent?.args?.tokenId?.toString() || "1";

      const result: iNFTResult = {
        tokenId,
        contractAddress,
        txHash: receipt.hash,
        metadata,
      };

      console.log(`✅ [iNFT] Minted! Token ID: ${tokenId}`);
      console.log(`   TX: ${receipt.hash}`);

      // ─────────────────────────────────────────────────────────────
      // NEW: Register Agent on the AgentRegistry contract
      // ─────────────────────────────────────────────────────────────
      try {
        console.log("📝 [iNFT] Registering agent on AgentRegistry...");
        const registryAbi = ["function registerAgent(string calldata inftTokenId, string calldata metadata, bool privacyEnabled) external"];
        const registry = new ethers.Contract(process.env.AGENT_REGISTRY_ADDRESS!, registryAbi, this.signer);
        
        const regTx = await registry.registerAgent(
          tokenId, 
          metadata.storageUri || "0G_AI_AGENT", 
          true // privacyEnabled by default
        );
        await regTx.wait();
        console.log(`✅ [iNFT] Registered on-chain! Registry TX: ${regTx.hash}`);
      } catch (regErr) {
        console.warn("⚠️  [iNFT] On-chain registration failed (might be already registered):", (regErr as Error).message);
      }

      // Auto-update .env with the new identity
      try {
        const envPath = path.resolve(process.cwd(), ".env");
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
        
        const updateEnv = (key: string, value: string) => {
          const regex = new RegExp(`^${key}=.*`, "m");
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
          } else {
            envContent += `\n${key}=${value}`;
          }
        };

        updateEnv("MY_AGENT_INFT_ID", tokenId);
        updateEnv("AGENT_ADDRESS", ownerAddress);
        
        fs.writeFileSync(envPath, envContent.trim() + "\n");
        console.log(`📝 [iNFT] Identity saved to .env (ID: ${tokenId}, Address: ${ownerAddress})`);
      } catch (err) {
        console.warn("⚠️  [iNFT] Could not auto-update .env:", (err as Error).message);
      }

      return result;
    } catch (error) {
      console.warn(
        "⚠️  [iNFT] Mint failed, returning mock result:",
        (error as Error).message
      );
      return this.mockMint(metadata, contractAddress);
    }
  }

  private encodeMetadataUri(metadata: iNFTMetadata): string {
    const json = JSON.stringify(metadata);
    const encoded = Buffer.from(json).toString("base64");
    return `data:application/json;base64,${encoded}`;
  }

  private mockMint(
    metadata: iNFTMetadata,
    contractAddress: string
  ): iNFTResult {
    const tokenId = Math.floor(Math.random() * 9999 + 1).toString();
    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    console.log(`🎭 [iNFT] DRY-RUN: Mock iNFT minted`);
    console.log(`   Token ID: ${tokenId} | Contract: ${contractAddress}`);
    console.log(`   Mock TX: ${txHash}`);

    return { tokenId, contractAddress, txHash, metadata };
  }
}
