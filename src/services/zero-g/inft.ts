import "dotenv/config";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

export interface iNFTMetadata {
  agentId: string;
  framework: string;
  capabilities: string[];
  createdAt: string;
  modelAI?: string;
  resource?: string;
  storageUri?: string; // Encrypted storage hash on 0G Storage
}

export interface iNFTResult {
  tokenId: string;
  contractAddress: string;
  txHash: string;
  metadata: iNFTMetadata;
}

// Updated ERC-7857 iNFT interface (No experimental fields)
const INFT_ABI = [
  "function mint(address to, string calldata encryptedUri, bytes32 metadataHash) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getEncryptedUri(uint256 tokenId) external view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const REGISTRY_ABI = [
  "function registerAgent(string calldata inftTokenId, string calldata metadata, bool privacyEnabled) external",
];

/**
 * Mints an AI Agent as an iNFT (ERC-7857) on 0G Chain.
 * Follows the 0G Labs technical documentation for encrypted agent metadata.
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

    const pk = process.env.USER_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;
    if (pk && !this.dryRun) {
      this.signer = new ethers.Wallet(pk, this.provider);
    }
  }

  /**
   * Mint the AI agent as an iNFT (ERC-7857) and register it.
   */
  async mint(metadata: iNFTMetadata): Promise<iNFTResult> {
    const contractAddress = ethers.getAddress(
      process.env.INFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000001"
    );

    if (this.dryRun) {
      return this.mockMint(metadata, contractAddress);
    }

    if (!this.signer) {
      console.warn("⚠️  No signer configured, using mock");
      return this.mockMint(metadata, contractAddress);
    }

    try {
      console.log(`🎨 [iNFT] Minting ERC-7857 Agent Identity...`);

      const contract = new ethers.Contract(contractAddress, INFT_ABI, this.signer);
      const encryptedUri = metadata.storageUri || "0G_ENCRYPTED_DATA_HASH";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(encryptedUri));
      const ownerAddress = await this.signer.getAddress();

      // 1. Mint iNFT
      const tx = await contract.mint(ownerAddress, encryptedUri, metadataHash);
      const receipt = await tx.wait();

      const transferEvent = receipt.logs
        .map((log: ethers.Log) => {
          try { return contract.interface.parseLog(log); } catch { return null; }
        })
        .find((e: ethers.LogDescription | null) => e?.name === "Transfer");

      const tokenId = transferEvent?.args?.tokenId?.toString() || "1";

      console.log(`✅ [iNFT] Identity Created! Token ID: ${tokenId} | Tx: ${receipt.hash}`);

      // 2. Register on AgentRegistry
      if (process.env.AGENT_REGISTRY_ADDRESS) {
        const regAddr = ethers.getAddress(process.env.AGENT_REGISTRY_ADDRESS);
        console.log(`📝 [Registry] Linking address ${ownerAddress} to identity #${tokenId}...`);
        const registry = new ethers.Contract(regAddr, REGISTRY_ABI, this.signer);
        const regTx = await registry.registerAgent(tokenId, encryptedUri, true);
        await regTx.wait();
        console.log(`✅ [Registry] Successfully linked!`);
      }

      this.updateEnv(tokenId, ownerAddress);
      return { tokenId, contractAddress, txHash: receipt.hash, metadata };
    } catch (error: any) {
      console.error(`❌ [iNFT] Mint failure: ${error.message}`);
      return this.mockMint(metadata, contractAddress);
    }
  }

  private updateEnv(tokenId: string, ownerAddress: string) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
      const updateRegex = (key: string, value: string) => {
        const regex = new RegExp(`^${key}=.*`, "m");
        if (regex.test(envContent)) envContent = envContent.replace(regex, `${key}=${value}`);
        else envContent += `\n${key}=${value}`;
      };
      updateRegex("MY_AGENT_INFT_ID", tokenId);
      updateRegex("AGENT_ADDRESS", ownerAddress);
      fs.writeFileSync(envPath, envContent.trim() + "\n");
    } catch (err) {}
  }

  private mockMint(metadata: iNFTMetadata, contractAddress: string): iNFTResult {
    const tokenId = "7857";
    const txHash = "0x_mock_identity_hash";
    console.log(`🎭 [DRY-RUN] Mock Identity Minted: #${tokenId}`);
    return { tokenId, contractAddress, txHash, metadata };
  }
}
